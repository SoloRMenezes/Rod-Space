from kandinsky import fill_rect, draw_string
from ion import keydown, KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN
from ion import KEY_ONE, KEY_TWO, KEY_THREE, KEY_FOUR, KEY_SIX
from ion import KEY_SEVEN, KEY_EIGHT, KEY_NINE, KEY_EXE, KEY_BACK
from time import monotonic, sleep
from random import random, randint
from math import sqrt

# Pocket Rush - NumWorks edition
W, H = 320, 222
TOP, BOTTOM = 18, 211
MARGIN = 24
BG = (10, 13, 22)
WHITE = (240, 244, 255)
CYAN = (32, 211, 238)
RED = (238, 70, 70)
YELLOW = (250, 204, 21)
GREEN = (52, 211, 153)
GREY = (70, 78, 96)

UPGRADES = (
    ("DAMAGE", "+1 bullet damage", "damage"),
    ("FIRE RATE", "shoot faster", "rate"),
    ("MOVE SPEED", "move faster", "speed"),
    ("MAX HEALTH", "+1 HP and heal", "health"),
    ("TWIN SHOT", "+1 projectile", "shots"),
    ("MAGNET", "collect farther", "magnet"),
    ("PIERCING", "hit +1 enemy", "pierce"),
    ("RECOVERY", "heal 2 HP", "heal"),
)

def pressed(key, old):
    now = keydown(key)
    return now and not old, now

def wait_release(key):
    while keydown(key):
        sleep(.03)

def title_screen(best):
    fill_rect(0, 0, W, H, BG)
    draw_string("POCKET RUSH", 105, 56, CYAN, BG)
    draw_string("Arrows+1-9: move", 70, 112, WHITE, BG)
    draw_string("Arrows+EXE: upgrade", 55, 133, WHITE, BG)
    draw_string("EXE TO START", 96, 173, GREEN, BG)
    if best:
        draw_string("BEST " + str(best), 118, 195, GREY, BG)
    while not keydown(KEY_EXE):
        sleep(.04)
    wait_release(KEY_EXE)

def choose_three():
    choices = []
    while len(choices) < 3:
        item = UPGRADES[randint(0, len(UPGRADES) - 1)]
        if item not in choices:
            choices.append(item)
    return choices

def upgrade_screen(level, choices):
    fill_rect(0, 0, W, H, (16, 21, 35))
    draw_string("LEVEL " + str(level), 119, 14, YELLOW, (16, 21, 35))
    draw_string("CHOOSE AN UPGRADE", 70, 37, WHITE, (16, 21, 35))
    selected = 0
    old_up = old_down = old_left = old_right = old_exe = False
    while True:
        y = 72
        for i in range(3):
            background = (49, 65, 92) if i == selected else (28, 36, 56)
            fill_rect(12, y - 5, 296, 39, background)
            draw_string(">" if i == selected else " ", 22, y + 8, YELLOW, background)
            draw_string(choices[i][0], 48, y - 1, WHITE, background)
            draw_string(choices[i][1], 48, y + 17, GREY, background)
            y += 46
        up, down = keydown(KEY_UP), keydown(KEY_DOWN)
        left, right, exe = keydown(KEY_LEFT), keydown(KEY_RIGHT), keydown(KEY_EXE)
        if (up and not old_up) or (left and not old_left): selected = (selected - 1) % 3
        if (down and not old_down) or (right and not old_right): selected = (selected + 1) % 3
        if exe and not old_exe:
            wait_release(KEY_EXE)
            return choices[selected][2]
        old_up, old_down = up, down
        old_left, old_right, old_exe = left, right, exe
        sleep(.03)

def apply_upgrade(name, stats):
    if name == "damage": stats[0] += 1
    elif name == "rate": stats[1] = max(.16, stats[1] * .84)
    elif name == "speed": stats[2] += 12
    elif name == "health":
        stats[3] += 1
        stats[4] = stats[3]
    elif name == "shots": stats[5] = min(3, stats[5] + 1)
    elif name == "magnet": stats[6] += 13
    elif name == "pierce": stats[7] += 1
    elif name == "heal": stats[4] = min(stats[3], stats[4] + 2)

def spawn_enemy(elapsed, level, camera_x, camera_y):
    side = randint(0, 3)
    left = camera_x - W / 2
    top = camera_y - (TOP + BOTTOM) / 2
    if side == 0: x, y = left - MARGIN, top + randint(TOP, BOTTOM)
    elif side == 1: x, y = left + W + MARGIN, top + randint(TOP, BOTTOM)
    elif side == 2: x, y = left + randint(0, W), top + TOP - MARGIN
    else: x, y = left + randint(0, W), top + BOTTOM + MARGIN
    hp = 1 + int(elapsed / 28) + int(level / 5)
    speed = 25 + min(35, elapsed * .22)
    return [float(x), float(y), hp, hp, speed, 5]

def game_over(score, level, best):
    if score > best: best = score
    fill_rect(0, 0, W, H, BG)
    draw_string("RUN OVER", 112, 53, RED, BG)
    draw_string("SCORE " + str(score), 112, 84, WHITE, BG)
    draw_string("LEVEL " + str(level), 112, 106, YELLOW, BG)
    draw_string("EXE: AGAIN", 107, 151, GREEN, BG)
    draw_string("BACK: EXIT", 107, 174, GREY, BG)
    while True:
        if keydown(KEY_EXE):
            wait_release(KEY_EXE)
            return True, best
        if keydown(KEY_BACK):
            wait_release(KEY_BACK)
            return False, best
        sleep(.04)

def play():
    # px/py are world coordinates. The player is always drawn at screen centre.
    px, py = 0.0, 0.0
    centre_x, centre_y = W // 2, (TOP + BOTTOM) // 2
    # damage, cooldown, speed, max_hp, hp, shots, magnet, pierce
    stats = [1, .55, 78, 4, 4, 1, 18, 0]
    enemies, bullets, drops = [], [], []
    level, xp, need, score = 1, 0, 8, 0
    start = monotonic()
    previous = start
    last_shot = start
    last_spawn = start
    hurt_until = 0

    while stats[4] > 0:
        now = monotonic()
        dt = min(.08, now - previous)
        previous = now
        elapsed = now - start

        # Arrows give the four main directions. The number pad supplies another
        # eight-way vector; combining both creates finer, roughly 16-way aim.
        dx = (1 if keydown(KEY_RIGHT) else 0) - (1 if keydown(KEY_LEFT) else 0)
        dy = (1 if keydown(KEY_DOWN) else 0) - (1 if keydown(KEY_UP) else 0)
        dx += ((1 if keydown(KEY_SIX) or keydown(KEY_NINE) or keydown(KEY_THREE) else 0)
               - (1 if keydown(KEY_FOUR) or keydown(KEY_SEVEN) or keydown(KEY_ONE) else 0))
        dy += ((1 if keydown(KEY_ONE) or keydown(KEY_TWO) or keydown(KEY_THREE) else 0)
               - (1 if keydown(KEY_SEVEN) or keydown(KEY_EIGHT) or keydown(KEY_NINE) else 0))
        move_length = sqrt(dx * dx + dy * dy)
        if move_length: dx, dy = dx / move_length, dy / move_length
        px += dx * stats[2] * dt
        py += dy * stats[2] * dt

        view_left = px - centre_x
        view_top = py - centre_y

        # Keep only enemies in the display and its small active border.
        for ei in range(len(enemies) - 1, -1, -1):
            e = enemies[ei]
            sx, sy = e[0] - view_left, e[1] - view_top
            if sx < -MARGIN or sx > W + MARGIN or sy < TOP - MARGIN or sy > BOTTOM + MARGIN:
                enemies.pop(ei)

        spawn_delay = max(.34, 1.12 - elapsed * .009)
        if now - last_spawn >= spawn_delay and len(enemies) < 16:
            last_spawn = now
            enemies.append(spawn_enemy(elapsed, level, px, py))

        nearest = None
        nearest_d = 999999
        for e in enemies:
            ex, ey = e[0] - px, e[1] - py
            d = ex * ex + ey * ey
            if d < nearest_d:
                nearest_d, nearest = d, e

        if nearest and now - last_shot >= stats[1]:
            last_shot = now
            ax, ay = nearest[0] - px, nearest[1] - py
            length = sqrt(ax * ax + ay * ay) or 1
            nx, ny = ax / length, ay / length
            for shot in range(stats[5]):
                spread = (shot - (stats[5] - 1) / 2.0) * .18
                vx = (nx - ny * spread) * 150
                vy = (ny + nx * spread) * 150
                bullets.append([px, py, vx, vy, stats[0], stats[7]])

        for e in enemies:
            ax, ay = px - e[0], py - e[1]
            length = sqrt(ax * ax + ay * ay) or 1
            e[0] += ax / length * e[4] * dt
            e[1] += ay / length * e[4] * dt
            if length < e[5] + 6 and now >= hurt_until:
                stats[4] -= 1
                hurt_until = now + .8

        for bi in range(len(bullets) - 1, -1, -1):
            b = bullets[bi]
            b[0] += b[2] * dt
            b[1] += b[3] * dt
            # Bullets are removed the instant their shape clears the display.
            screen_x, screen_y = b[0] - view_left, b[1] - view_top
            if screen_x < -3 or screen_x > W + 3 or screen_y < TOP - 3 or screen_y > BOTTOM + 3:
                bullets.pop(bi)
                continue
            for ei in range(len(enemies) - 1, -1, -1):
                e = enemies[ei]
                ax, ay = b[0] - e[0], b[1] - e[1]
                if ax * ax + ay * ay <= (e[5] + 3) * (e[5] + 3):
                    e[2] -= b[4]
                    if e[2] <= 0:
                        drops.append([e[0], e[1], 1])
                        enemies.pop(ei)
                        score += 1
                    if b[5] > 0: b[5] -= 1
                    else:
                        bullets.pop(bi)
                        break

        for di in range(len(drops) - 1, -1, -1):
            d = drops[di]
            screen_x, screen_y = d[0] - view_left, d[1] - view_top
            if screen_x < -MARGIN or screen_x > W + MARGIN or screen_y < TOP - MARGIN or screen_y > BOTTOM + MARGIN:
                drops.pop(di)
                continue
            ax, ay = px - d[0], py - d[1]
            dist2 = ax * ax + ay * ay
            if dist2 < stats[6] * stats[6] and dist2 > 1:
                length = sqrt(dist2)
                d[0] += ax / length * 115 * dt
                d[1] += ay / length * 115 * dt
            if dist2 < 100:
                xp += d[2]
                drops.pop(di)

        if xp >= need:
            xp -= need
            level += 1
            need = int(need * 1.28) + 2
            apply_upgrade(upgrade_screen(level, choose_three()), stats)
            previous = monotonic()
            last_shot = previous

        fill_rect(0, 0, W, H, BG)
        fill_rect(0, 0, W, TOP, (20, 27, 43))
        draw_string("HP " + str(stats[4]) + "/" + str(stats[3]), 3, 1, GREEN if stats[4] > 1 else RED, (20, 27, 43))
        draw_string("LV " + str(level), 126, 1, YELLOW, (20, 27, 43))
        draw_string(str(score), 277, 1, WHITE, (20, 27, 43))
        fill_rect(0, H - 7, W, 7, (25, 31, 46))
        fill_rect(0, H - 7, int(W * xp / need), 7, CYAN)

        for d in drops:
            fill_rect(int(d[0] - view_left) - 2, int(d[1] - view_top) - 2, 5, 5, YELLOW)
        for b in bullets:
            fill_rect(int(b[0] - view_left) - 1, int(b[1] - view_top) - 1, 3, 3, WHITE)
        for e in enemies:
            screen_x, screen_y = e[0] - view_left, e[1] - view_top
            if -6 < screen_x < W + 6 and TOP - 6 < screen_y < BOTTOM + 6:
                color = RED if e[2] == e[3] else (246, 120, 80)
                fill_rect(int(screen_x) - e[5], int(screen_y) - e[5], e[5] * 2, e[5] * 2, color)
        player_color = WHITE if now < hurt_until and int(now * 12) % 2 else CYAN
        fill_rect(centre_x - 5, centre_y - 5, 11, 11, player_color)

        if keydown(KEY_BACK):
            wait_release(KEY_BACK)
            return score, level, False
        # Aim for a much smoother refresh; the calculator may run below this
        # target during crowded late-game waves.
        sleep(.015)
    return score, level, True

best = 0
running = True
while running:
    title_screen(best)
    result, reached, died = play()
    if died:
        running, best = game_over(result, reached, best)
    else:
        running = False
