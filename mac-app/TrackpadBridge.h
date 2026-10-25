#pragma once
typedef void (*RSTrackpadCallback)(const char *json);
void RSStartTrackpad(RSTrackpadCallback callback);
void RSStopTrackpad(void);
