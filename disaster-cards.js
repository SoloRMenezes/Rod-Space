// Original situations and subjective ratings; not the commercial Shit Happens deck.
const DISASTER_CARDS = [
  {
    "id": 0,
    "score": 0.5,
    "text": "Your sleeve gets wet washing your hands. This is your villain origin story."
  },
  {
    "id": 1,
    "score": 1.0,
    "text": "You wave back at someone who was waving at the attractive person behind you."
  },
  {
    "id": 2,
    "score": 1.5,
    "text": "The self-checkout loudly demands assistance for your single banana."
  },
  {
    "id": 3,
    "score": 2.0,
    "text": "Your fitted sheet escapes one corner immediately after you finish making the bed."
  },
  {
    "id": 4,
    "score": 2.5,
    "text": "You bite a chocolate-chip cookie. Raisins. A fucking ambush."
  },
  {
    "id": 5,
    "score": 3.0,
    "text": "Your takeaway arrives with seventeen forks and absolutely no food."
  },
  {
    "id": 6,
    "score": 3.5,
    "text": "Your sock slides halfway off inside your shoe during an important walk."
  },
  {
    "id": 7,
    "score": 4.0,
    "text": "You pull a door that says PUSH while making eye contact with the receptionist."
  },
  {
    "id": 8,
    "score": 4.5,
    "text": "Your phone autocorrects “thanks” to “thighs” in the family chat."
  },
  {
    "id": 9,
    "score": 5.0,
    "text": "You microwave soup. The bowl is lava. The soup is an arctic research station."
  },
  {
    "id": 10,
    "score": 5.5,
    "text": "A pigeon looks directly at you and steals the best chip."
  },
  {
    "id": 11,
    "score": 6.0,
    "text": "You sit down with cereal and discover the milk is now cheese-adjacent."
  },
  {
    "id": 12,
    "score": 6.5,
    "text": "Someone uses your favourite mug as a container for loose screws."
  },
  {
    "id": 13,
    "score": 7.0,
    "text": "You say “you too” when the waiter tells you to enjoy your meal."
  },
  {
    "id": 14,
    "score": 7.5,
    "text": "Your umbrella turns inside out after one drop of rain."
  },
  {
    "id": 15,
    "score": 8.0,
    "text": "A toddler points at you and confidently says “goblin”."
  },
  {
    "id": 16,
    "score": 8.5,
    "text": "You accidentally like your own post while checking whether anyone else has."
  },
  {
    "id": 17,
    "score": 9.0,
    "text": "The vending machine takes your money and holds your snack hostage."
  },
  {
    "id": 18,
    "score": 9.5,
    "text": "You discover a price sticker on your sunglasses after wearing them all day."
  },
  {
    "id": 19,
    "score": 10.0,
    "text": "The bus arrives the exact second you decide to tie your shoe."
  },
  {
    "id": 20,
    "score": 10.5,
    "text": "A fly lands on your food and rubs its hands like a landlord."
  },
  {
    "id": 21,
    "score": 11.0,
    "text": "Your Bluetooth connects to the neighbour's speaker during your dramatic shower solo."
  },
  {
    "id": 22,
    "score": 11.5,
    "text": "You send “love you” to the plumber. He sends a thumbs-up."
  },
  {
    "id": 23,
    "score": 12.0,
    "text": "Your delivery photo shows your pizza outside a completely different house."
  },
  {
    "id": 24,
    "score": 12.5,
    "text": "The automatic tap ignores you but instantly obeys the person beside you."
  },
  {
    "id": 25,
    "score": 13.0,
    "text": "You finish a passionate rant and realise the microphone was muted."
  },
  {
    "id": 26,
    "score": 13.5,
    "text": "Your trousers make a fart noise every time you sit on the office chair."
  },
  {
    "id": 27,
    "score": 14.0,
    "text": "You ask someone when the baby is due. They are carrying a melon."
  },
  {
    "id": 28,
    "score": 14.5,
    "text": "Your shopping bag splits and a watermelon overtakes you downhill."
  },
  {
    "id": 29,
    "score": 15.0,
    "text": "A stranger tells you that you look exactly like their least favourite uncle."
  },
  {
    "id": 30,
    "score": 15.5,
    "text": "Your alarm sound plays in public and your entire body experiences war flashbacks."
  },
  {
    "id": 31,
    "score": 16.0,
    "text": "You pull out a tissue and launch every receipt you have ever owned."
  },
  {
    "id": 32,
    "score": 16.5,
    "text": "Your barber says “oops” and then refuses to elaborate."
  },
  {
    "id": 33,
    "score": 17.0,
    "text": "You discover your shirt has been inside out since breakfast. It is now dinner."
  },
  {
    "id": 34,
    "score": 17.5,
    "text": "Your takeaway curry opens itself inside your backpack."
  },
  {
    "id": 35,
    "score": 18.0,
    "text": "A bird shits on your freshly washed car while you are still holding the hose."
  },
  {
    "id": 36,
    "score": 18.5,
    "text": "The dentist asks a question while occupying your entire mouth."
  },
  {
    "id": 37,
    "score": 19.0,
    "text": "Your cat knocks your drink over, watches you clean it, then knocks the replacement over."
  },
  {
    "id": 38,
    "score": 19.5,
    "text": "Your new shoes squeak so loudly that people turn around before they see you."
  },
  {
    "id": 39,
    "score": 20.0,
    "text": "You accidentally applaud the start of a minute's silence."
  },
  {
    "id": 40,
    "score": 20.5,
    "text": "You spend an hour finding your phone. The torch you used was on your phone."
  },
  {
    "id": 41,
    "score": 21.0,
    "text": "You follow a stranger through three train carriages because you think they're your friend."
  },
  {
    "id": 42,
    "score": 21.5,
    "text": "Your voice assistant reads your shopping list aloud. It is just “deodorant” seven times."
  },
  {
    "id": 43,
    "score": 22.0,
    "text": "You tell the same story twice at dinner. Someone says “third time, actually”."
  },
  {
    "id": 44,
    "score": 22.5,
    "text": "You order a mild curry and briefly meet your ancestors."
  },
  {
    "id": 45,
    "score": 23.0,
    "text": "Your haircut gives you the exact silhouette of a mushroom."
  },
  {
    "id": 46,
    "score": 23.5,
    "text": "You drop your last clean towel into the toilet before your shower."
  },
  {
    "id": 47,
    "score": 24.0,
    "text": "A child asks why your face looks tired. You have slept eleven hours."
  },
  {
    "id": 48,
    "score": 24.5,
    "text": "You spend twenty minutes arguing with a chatbot that is actually your manager."
  },
  {
    "id": 49,
    "score": 25.0,
    "text": "Your “silent” fart arrives with surround sound."
  },
  {
    "id": 50,
    "score": 25.5,
    "text": "Your phone falls onto your face and hangs up on the person you're complaining about."
  },
  {
    "id": 51,
    "score": 26.0,
    "text": "Your new tattoo's inspirational Latin is apparently a pasta instruction."
  },
  {
    "id": 52,
    "score": 26.5,
    "text": "You accidentally send your grocery list to the wedding group. It includes “divorce snacks”."
  },
  {
    "id": 53,
    "score": 27.0,
    "text": "A fitness app congratulates you on a workout. You were struggling to put on jeans."
  },
  {
    "id": 54,
    "score": 27.5,
    "text": "You get locked out wearing slippers shaped like enormous ducks."
  },
  {
    "id": 55,
    "score": 28.0,
    "text": "You lean on a door during a speech and disappear into a cupboard."
  },
  {
    "id": 56,
    "score": 28.5,
    "text": "You introduce yourself to someone who says you've met seven times."
  },
  {
    "id": 57,
    "score": 29.0,
    "text": "Your neighbour returns a parcel and says they could hear it vibrating."
  },
  {
    "id": 58,
    "score": 29.5,
    "text": "You leave a voice note while chewing. It sounds like a horse filing taxes."
  },
  {
    "id": 59,
    "score": 30.0,
    "text": "You send a heart emoji to the person who just rejected your job application."
  },
  {
    "id": 60,
    "score": 30.5,
    "text": "Your dog steals a stranger's sandwich and brings it to you like a promotion."
  },
  {
    "id": 61,
    "score": 31.0,
    "text": "You discover the “fresh herb” in your dinner was a decorative plastic plant."
  },
  {
    "id": 62,
    "score": 31.5,
    "text": "You accidentally join a work call with a filter that gives you a giant horse mouth."
  },
  {
    "id": 63,
    "score": 32.0,
    "text": "Your chair slowly sinks during a negotiation until only your forehead is visible."
  },
  {
    "id": 64,
    "score": 32.5,
    "text": "Your date says you remind them of their therapist. They fired that therapist."
  },
  {
    "id": 65,
    "score": 33.0,
    "text": "You rehearse an argument in the lift. The doors open on the actual person."
  },
  {
    "id": 66,
    "score": 33.5,
    "text": "Your contact lens disappears and you spend the day winking like a suspicious pirate."
  },
  {
    "id": 67,
    "score": 34.0,
    "text": "Your parents discover your old poetry folder and ask you to explain “dark wolf within”."
  },
  {
    "id": 68,
    "score": 34.5,
    "text": "The toilet flushes before you stand up and launches a hostile little splash."
  },
  {
    "id": 69,
    "score": 35.0,
    "text": "You pay for premium Wi-Fi that proudly loads only the payment page."
  },
  {
    "id": 70,
    "score": 35.5,
    "text": "Your dating profile is recommended to your entire office group chat."
  },
  {
    "id": 71,
    "score": 36.0,
    "text": "You trip carrying a birthday cake. The candles survive. The cake doesn't."
  },
  {
    "id": 72,
    "score": 36.5,
    "text": "You call your boss “Dad” in a room full of people who immediately hear it."
  },
  {
    "id": 73,
    "score": 37.0,
    "text": "Your phone screen mirrors to the TV with “how to politely leave these people” open."
  },
  {
    "id": 74,
    "score": 37.5,
    "text": "You give a confident presentation with spinach guarding both front teeth."
  },
  {
    "id": 75,
    "score": 38.0,
    "text": "You send a screenshot mocking a message straight back to its author."
  },
  {
    "id": 76,
    "score": 38.5,
    "text": "Your dog eats your passport two days before a holiday."
  },
  {
    "id": 77,
    "score": 39.0,
    "text": "You realise the person you have been loudly complaining about is directly behind you."
  },
  {
    "id": 78,
    "score": 39.5,
    "text": "Your smoke alarm announces your cooking skills to the entire building at 3 a.m."
  },
  {
    "id": 79,
    "score": 40.0,
    "text": "You get stuck in a jumper in a shop changing room and have to request rescue."
  },
  {
    "id": 80,
    "score": 40.5,
    "text": "You order an expensive birthday gift and receive a tiny framed photo of the item."
  },
  {
    "id": 81,
    "score": 41.0,
    "text": "You arrive at a costume party. It is not a costume party. You are a toilet."
  },
  {
    "id": 82,
    "score": 41.5,
    "text": "Your phone pocket-dials your ex during your dramatic explanation of being over them."
  },
  {
    "id": 83,
    "score": 42.0,
    "text": "Your hair dye promises midnight black and delivers traffic-cone orange."
  },
  {
    "id": 84,
    "score": 42.5,
    "text": "A seagull steals your lunch, returns, and steals the napkin for disrespect."
  },
  {
    "id": 85,
    "score": 43.0,
    "text": "Your neighbour starts learning the recorder. Their favourite song has three notes."
  },
  {
    "id": 86,
    "score": 43.5,
    "text": "Your washing machine turns every item you own a provocative shade of pink."
  },
  {
    "id": 87,
    "score": 44.0,
    "text": "You accidentally refer to the bride by the groom's ex's name in your toast."
  },
  {
    "id": 88,
    "score": 44.5,
    "text": "Your friend names their difficult houseplant after you."
  },
  {
    "id": 89,
    "score": 45.0,
    "text": "You get a parking ticket while buying a parking ticket."
  },
  {
    "id": 90,
    "score": 45.5,
    "text": "You livestream your desk and reveal the tab titled “can they fire me for this”."
  },
  {
    "id": 91,
    "score": 46.0,
    "text": "The hairdresser cuts your fringe during a sneeze. You now have architectural eyebrows."
  },
  {
    "id": 92,
    "score": 46.5,
    "text": "You lose your wallet on the first hour of a trip you described as “stress-free”."
  },
  {
    "id": 93,
    "score": 47.0,
    "text": "Your landlord paints over the light switches and calls it a renovation."
  },
  {
    "id": 94,
    "score": 47.5,
    "text": "Your trousers split while you are demonstrating how flexible you still are."
  },
  {
    "id": 95,
    "score": 48.0,
    "text": "You send a seven-minute angry voice note. The final minute is you struggling to stop recording."
  },
  {
    "id": 96,
    "score": 48.5,
    "text": "Your face is used in the company training slide labelled “what not to do”."
  },
  {
    "id": 97,
    "score": 49.0,
    "text": "You pay for a portrait and it looks more like your dad than you do."
  },
  {
    "id": 98,
    "score": 49.5,
    "text": "The entire restaurant sings happy birthday to you. It isn't your birthday. You can't stop them."
  },
  {
    "id": 99,
    "score": 50.0,
    "text": "Your flatmate starts a midnight blender-based wellness journey."
  },
  {
    "id": 100,
    "score": 50.5,
    "text": "You discover your expensive perfume smells exactly like the office toilet cleaner."
  },
  {
    "id": 101,
    "score": 51.0,
    "text": "Your online order arrives as 400 miniature chairs instead of one normal chair."
  },
  {
    "id": 102,
    "score": 51.5,
    "text": "You get trapped in a lift with a motivational speaker and a working microphone."
  },
  {
    "id": 103,
    "score": 52.0,
    "text": "Your wedding photographer spends most of the day photographing the wrong couple."
  },
  {
    "id": 104,
    "score": 52.5,
    "text": "You wave goodbye to everyone, then walk into a glass wall without breaking stride."
  },
  {
    "id": 105,
    "score": 53.0,
    "text": "Your phone autocorrects a resignation email to “I am delighted to remain your prisoner”."
  },
  {
    "id": 106,
    "score": 53.5,
    "text": "You accidentally send your boss a calendar invite titled “survive this clown”."
  },
  {
    "id": 107,
    "score": 54.0,
    "text": "Your neighbours applaud after you finally finish a very loud argument with a printer."
  },
  {
    "id": 108,
    "score": 54.5,
    "text": "You buy a used sofa and discover it comes with someone else's pet snake."
  },
  {
    "id": 109,
    "score": 55.0,
    "text": "You find out your family has a second group chat called “without the drama”."
  },
  {
    "id": 110,
    "score": 55.5,
    "text": "You lock your keys in the car with the engine running and your lunch slowly rotating on the roof."
  },
  {
    "id": 111,
    "score": 56.0,
    "text": "You miss your flight because you queue at an airport café that looks like the departure gate."
  },
  {
    "id": 112,
    "score": 56.5,
    "text": "Your dentist recognises you from a video called “man loses fight with revolving door”."
  },
  {
    "id": 113,
    "score": 57.0,
    "text": "You accidentally bid on an auction and now own a life-size fibreglass horse."
  },
  {
    "id": 114,
    "score": 57.5,
    "text": "Your boss forwards your complaint about them back to you with “interesting”."
  },
  {
    "id": 115,
    "score": 58.0,
    "text": "You discover your best friend has been telling your embarrassing stories as their own stand-up material."
  },
  {
    "id": 116,
    "score": 58.5,
    "text": "You delete a week's work and confidently empty the recycle bin immediately afterwards."
  },
  {
    "id": 117,
    "score": 59.0,
    "text": "Your new flat's peaceful view is a billboard that lights up at bedroom height all night."
  },
  {
    "id": 118,
    "score": 59.5,
    "text": "You drop your phone into a festival toilet. It is still ringing."
  },
  {
    "id": 119,
    "score": 60.0,
    "text": "Your tattoo artist sneezes halfway through the portrait. Your mum now has three eyes and a moustache."
  },
  {
    "id": 120,
    "score": 60.5,
    "text": "Your ceiling collapses into your bed while you are sleeping. The landlord calls it an open-plan feature."
  },
  {
    "id": 121,
    "score": 61.0,
    "text": "Your homemade dinner gives the entire wedding food poisoning, including the ambulance crew."
  },
  {
    "id": 122,
    "score": 61.5,
    "text": "You send the wedding invitations with the wrong date. Half the guests book flights before anyone notices."
  },
  {
    "id": 123,
    "score": 62.0,
    "text": "Your neighbours upload a noise complaint with audio. It becomes a remix played at your workplace."
  },
  {
    "id": 124,
    "score": 62.5,
    "text": "Your mum prints your entire dating history and runs a family presentation titled ‘Patterns of Failure’."
  },
  {
    "id": 125,
    "score": 63.0,
    "text": "You spend your holiday money on fake concert tickets, then see the scammer enjoying the show from the front row."
  },
  {
    "id": 126,
    "score": 63.5,
    "text": "Your boss fires you during a trust fall. Everyone steps aside and the meeting continues over you."
  },
  {
    "id": 127,
    "score": 64.0,
    "text": "Nobody comes to your surprise party, except your ex, who arrives with your replacement."
  },
  {
    "id": 128,
    "score": 64.5,
    "text": "You post an unfiltered rant from the company account, tag every customer, and discover screen recording exists."
  },
  {
    "id": 129,
    "score": 65.0,
    "text": "Doctors name a contagious rash after you because your holiday photos caused the first public alert."
  },
  {
    "id": 130,
    "score": 65.5,
    "text": "Your upstairs neighbour opens a 24-hour tap-dancing gym directly above your bedroom."
  },
  {
    "id": 131,
    "score": 66.0,
    "text": "Your non-refundable honeymoon hotel is an active construction site with one mattress and a haunted fish tank."
  },
  {
    "id": 132,
    "score": 66.5,
    "text": "Your car gets towed with your friend asleep inside. They wake up at the scrapyard and blame you forever."
  },
  {
    "id": 133,
    "score": 67.0,
    "text": "Your private diary becomes a family audiobook, complete with impressions and a chapter about everyone present."
  },
  {
    "id": 134,
    "score": 67.5,
    "text": "Your honeymoon hotel is hosting your ex's wedding, and the only spare room opens directly onto their reception."
  },
  {
    "id": 135,
    "score": 68.0,
    "text": "Your removal company delivers every possession you own to a town with the same name overseas."
  },
  {
    "id": 136,
    "score": 68.5,
    "text": "Your life savings went on a ‘rare collectible’ that came free in cereal and is still in production."
  },
  {
    "id": 137,
    "score": 69.0,
    "text": "Your entire office receives the salary spreadsheet, including your tab called “criminally underpaid”."
  },
  {
    "id": 138,
    "score": 69.5,
    "text": "A burst pipe floods your flat five minutes after you finish decorating."
  },
  {
    "id": 139,
    "score": 70.0,
    "text": "You are mistaken for a surgeon, panic, and only expose the mistake after confidently entering the operating theatre."
  },
  {
    "id": 140,
    "score": 70.5,
    "text": "Your landlord sells your occupied flat as ‘vacant’ and the new owner moves in while you are in the shower."
  },
  {
    "id": 141,
    "score": 71.0,
    "text": "Your best man's speech reveals the affair you confessed to him in confidence. Both families hear it before your partner does."
  },
  {
    "id": 142,
    "score": 71.5,
    "text": "Your luggage goes to Tokyo with your medication and passport copy. You reach Birmingham with one wet sock."
  },
  {
    "id": 143,
    "score": 72.0,
    "text": "You find out the expensive course you bought is a folder of screenshots from free tutorials."
  },
  {
    "id": 144,
    "score": 72.5,
    "text": "Your identity gets stolen by someone who immediately gets better credit than you."
  },
  {
    "id": 145,
    "score": 73.0,
    "text": "Your car catches fire on a first date outside your ex's house. Your ex comes out filming."
  },
  {
    "id": 146,
    "score": 73.5,
    "text": "Your neighbour converts the shared wall into a nightclub speaker test lab that operates until sunrise."
  },
  {
    "id": 147,
    "score": 74.0,
    "text": "Your wedding venue double-books a ferret exhibition. The ferrets eat the cake and escape into the ceremony."
  },
  {
    "id": 148,
    "score": 74.5,
    "text": "Black mould covers your flat, ruins your belongings, and your landlord invoices you for ‘unauthorised biology’."
  },
  {
    "id": 149,
    "score": 75.0,
    "text": "Your clinic sends your entire contact list the photos from an appointment labelled ‘aggressive mystery rash’."
  },
  {
    "id": 150,
    "score": 75.5,
    "text": "You get fired by an automated email that starts with “Congratulations on your next chapter”."
  },
  {
    "id": 151,
    "score": 76.0,
    "text": "Your house gets burgled and the thief leaves your music collection with a note saying “keep it”."
  },
  {
    "id": 152,
    "score": 76.5,
    "text": "Your cat causes a small kitchen fire, then refuses to leave its expensive carrier during the evacuation."
  },
  {
    "id": 153,
    "score": 77.0,
    "text": "Your dream job turns out to be selling the training course for your dream job."
  },
  {
    "id": 154,
    "score": 77.5,
    "text": "You lose your front tooth biting a bread roll labelled “soft”."
  },
  {
    "id": 155,
    "score": 78.0,
    "text": "Your flatmate secretly rents your room to tourists whenever you work late."
  },
  {
    "id": 156,
    "score": 78.5,
    "text": "Your wedding ring slips off your finger into the harbour during the proposal reenactment."
  },
  {
    "id": 157,
    "score": 79.0,
    "text": "Your bank freezes your account during your holiday and says to visit your local branch."
  },
  {
    "id": 158,
    "score": 79.5,
    "text": "You discover your business logo is nearly identical to a notorious plumbing disaster meme."
  },
  {
    "id": 159,
    "score": 80.0,
    "text": "You wake up after a blackout drunk night married to your ex's dad. Neither of you remembers whose idea it was."
  },
  {
    "id": 160,
    "score": 80.5,
    "text": "Your partner dumps you by adding ‘new boyfriend's condoms’ to your shared grocery list."
  },
  {
    "id": 161,
    "score": 81.0,
    "text": "Your hard drive dies with your life's work and an unreleased sex tape. The recovery shop restores only the sex tape."
  },
  {
    "id": 162,
    "score": 81.5,
    "text": "You total a rental hearse during a funeral procession and the coffin keeps going without you."
  },
  {
    "id": 163,
    "score": 82.0,
    "text": "Your toilet explodes during a dinner party and coats every guest from the waist down."
  },
  {
    "id": 164,
    "score": 82.5,
    "text": "Your partner asks for an open relationship, then reveals everyone at the table already knew except you."
  },
  {
    "id": 165,
    "score": 83.0,
    "text": "Your business accidentally ships edible underwear instead of school uniforms to three hundred parents."
  },
  {
    "id": 166,
    "score": 83.5,
    "text": "Your wedding cake contains the ring, a used condom, and absolutely no explanation from the baker."
  },
  {
    "id": 167,
    "score": 84.0,
    "text": "You accidentally send your rent money to your ex with the reference ‘one last ride’. Their new partner replies."
  },
  {
    "id": 168,
    "score": 84.5,
    "text": "The sewage main erupts through your toilet during sex and floods the entire building before either of you can get dressed."
  },
  {
    "id": 169,
    "score": 85.0,
    "text": "Your insurer rejects your house-fire claim because your smoke alarm was one day past its replacement date."
  },
  {
    "id": 170,
    "score": 85.5,
    "text": "Your boss screenshares your private messages about everyone in the office, then asks you to finish the presentation."
  },
  {
    "id": 171,
    "score": 86.0,
    "text": "You come home early to find your partner, your boss, and your childhood bully sharing your bed and your takeaway."
  },
  {
    "id": 172,
    "score": 86.5,
    "text": "Your home is condemned because a corpse has been decomposing inside the shared wall since before you moved in."
  },
  {
    "id": 173,
    "score": 87.0,
    "text": "You spend your savings opening a restaurant. Its grand opening becomes the city's largest recorded food-poisoning outbreak."
  },
  {
    "id": 174,
    "score": 87.5,
    "text": "Your identity thief starts an adult channel in your name and becomes more successful than you have ever been."
  },
  {
    "id": 175,
    "score": 88.0,
    "text": "Your landlord evicts you, lists your belongings as furnished, and rents the place to the person your partner cheated with."
  },
  {
    "id": 176,
    "score": 88.5,
    "text": "You learn your accountant spent your tax money on a sex dungeon registered under your name."
  },
  {
    "id": 177,
    "score": 89.0,
    "text": "The police find a secret room under your house containing restraints, cameras, and documents with your name on them."
  },
  {
    "id": 178,
    "score": 89.5,
    "text": "You wake up naked on a foreign beach with no passport, no memory, and a fresh tattoo reading ‘PROPERTY OF GARY’."
  },
  {
    "id": 179,
    "score": 90.0,
    "text": "Your partner announces your breakup onstage, then proposes to your teammate while the pub scores your reaction."
  },
  {
    "id": 180,
    "score": 90.5,
    "text": "Your pension disappears into a crypto coin named after a cartoon testicle. Your dad convinced the whole family to buy it."
  },
  {
    "id": 181,
    "score": 91.0,
    "text": "Your unpublished autobiography leaks. Every person you insulted receives a highlighted copy from an anonymous sender."
  },
  {
    "id": 182,
    "score": 91.5,
    "text": "Your wedding planner vanishes with the budget and reappears online marrying your fiancé at the venue you paid for."
  },
  {
    "id": 183,
    "score": 92.0,
    "text": "Your parents' homemade sex tape opens instead of the film at family movie night. The television remote stops working."
  },
  {
    "id": 184,
    "score": 92.5,
    "text": "A tree crushes your bedroom while you are having sex. The rescue footage shows everything live on national television."
  },
  {
    "id": 185,
    "score": 93.0,
    "text": "You return from holiday to strangers living in your legally sold house. Your signature, passport and lawyer were all fake."
  },
  {
    "id": 186,
    "score": 93.5,
    "text": "Your neighbour's illegal firework enters your bathroom, explodes beneath you, and the doorbell camera captures the escape."
  },
  {
    "id": 187,
    "score": 94.0,
    "text": "You donate a kidney to your partner. They recover, leave you for the surgeon, and take the dog."
  },
  {
    "id": 188,
    "score": 94.5,
    "text": "You invest your life savings in your brother's business and discover it is a brothel operating from your address."
  },
  {
    "id": 189,
    "score": 95.0,
    "text": "Your partner of ten years admits they have another spouse, another family, and the same pet names for all of you."
  },
  {
    "id": 190,
    "score": 95.5,
    "text": "You are arrested abroad after airport security finds a bag of drugs surgically hidden inside your souvenir."
  },
  {
    "id": 191,
    "score": 96.0,
    "text": "A flash flood destroys your home, your pets are missing, and your family albums wash up on strangers' social feeds."
  },
  {
    "id": 192,
    "score": 96.5,
    "text": "A routine operation removes the wrong organ. The hospital sends flowers to the patient who received yours."
  },
  {
    "id": 193,
    "score": 97.0,
    "text": "Your closest friend empties your emergency fund, frames you for the theft, and uses your money to hire the lawyer."
  },
  {
    "id": 194,
    "score": 97.5,
    "text": "Your house burns down during your surprise birthday orgy. Everyone escapes naked except you, who must explain it to the fire brigade."
  },
  {
    "id": 195,
    "score": 98.0,
    "text": "Your parents invite you to their swingers retreat. A booking error leaves one room, one bed, and a name tag saying ‘participant’."
  },
  {
    "id": 196,
    "score": 98.5,
    "text": "Your life savings vanish in a cult run by your mum, who uses the money to erect a nude statue of herself outside your home."
  },
  {
    "id": 197,
    "score": 99.0,
    "text": "A freak accident permanently changes your mobility. It was caused by the sex toy you publicly warned everyone was perfectly safe."
  },
  {
    "id": 198,
    "score": 99.5,
    "text": "At a funeral, the coffin opens and reveals the wrong person. Your missing relative answers your postponed call from inside the crematorium."
  },
  {
    "id": 199,
    "score": 100.0,
    "text": "A DNA test proves your spouse is your unknown half-sibling, your father knew, and your pregnancy announcement is already viral."
  }
];
