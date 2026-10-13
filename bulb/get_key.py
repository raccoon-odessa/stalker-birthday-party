"""Fetch your Tuya bulb's local key by logging in with the Smart Life app (QR code).
No Tuya developer account needed. Writes devices.json for bulb_test.py.
Uses the same login method as Home Assistant's built-in Tuya integration."""
import json, os, sys, time

try:
    from tuya_sharing import LoginControl, Manager, SharingTokenListener
    import qrcode
except ImportError:
    sys.exit("Missing libraries. Run SETUP-AND-TEST.bat instead of this file.")

CLIENT_ID = "HA_3y9q4ak7g4ephrvke"
SCHEMA = "haauthorize"

print("Open Smart Life on your phone: Me > Settings (gear) > Account and Security > User Code.")
user_code = input("Type that User Code here and press Enter: ").strip()
if not user_code:
    sys.exit("No user code entered.")

login = LoginControl()
resp = login.qr_code(CLIENT_ID, SCHEMA, user_code)
if not resp or not resp.get("success"):
    sys.exit("Tuya refused the user code: %s" % (resp.get("msg") if resp else "no answer"))
token = resp["result"]["qrcode"]
content = "tuyaSmart--qrLogin?token=" + token

img = qrcode.make(content)
img.save("login-qr.png")
try:
    os.startfile("login-qr.png")
except Exception:
    pass
print("\nA QR code opened in a new window (also saved as login-qr.png).")
print("In Smart Life tap the scan icon (top right of the Home tab), scan it and confirm the login.\n")

info = None
for _ in range(90):
    ok, data = login.login_result(token, CLIENT_ID, user_code)
    if ok:
        info = data
        break
    time.sleep(2)
if not info:
    sys.exit("No login within 3 minutes. Run the setup again.")
print("Logged in as", info.get("username", "your account"))

class _Tokens(SharingTokenListener):
    def update_token(self, token_info):
        pass

token_info = {k: info[k] for k in ("t", "uid", "expire_time", "access_token", "refresh_token") if k in info}
manager = Manager(CLIENT_ID, user_code, info["terminal_id"], info["endpoint"], token_info, _Tokens())
manager.update_device_cache()

out = []
for dev in manager.device_map.values():
    key = getattr(dev, "local_key", None)
    print(" -", dev.name, "| id", dev.id, "| key found" if key else "| no key")
    if key:
        out.append({"name": dev.name, "id": dev.id, "key": key, "ip": getattr(dev, "ip", "") or ""})
if not out:
    sys.exit("No devices with a local key were found on this account.")
with open("devices.json", "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2)
print("\nSaved devices.json with %d device(s)." % len(out))
