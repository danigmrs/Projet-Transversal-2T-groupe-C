# main.py – Raspberry Pi Pico W (MicroPython)
# Branchement :
#   Bouton/LED JAUNE  -> GP9  (btn) / GP13 (led)
#   Bouton/LED VERT   -> GP8  (btn) / GP12 (led)
#   Bouton/LED ROUGE  -> GP7  (btn) / GP11 (led)
#   Bouton/LED BLEU   -> GP6  (btn) / GP10 (led)

import machine
import utime
import network
import secrets
from umqtt.simple import MQTTClient

# ─── CONFIGURATION MQTT ───────────────────────────────────────────────────────
MQTT_BROKER  = "10.214.81.52"
TOPIC_PRESS  = b"pico/groupe3/simon/press"
TOPIC_CMD    = b"pico/groupe3/simon/cmd"

global wlan, client

# ─── Pins ─────────────────────────────────────────────────────────────────────
COLORS   = ["yellow", "green", "red", "blue"]
BTN_PINS = {"yellow": 6, "green": 7, "red": 8, "blue": 9}
LED_PINS = {"yellow": 10, "green": 11, "red": 12, "blue": 13}

btns = {c: machine.Pin(p, machine.Pin.IN,  machine.Pin.PULL_DOWN) for c, p in BTN_PINS.items()}
leds = {c: machine.Pin(p, machine.Pin.OUT)                         for c, p in LED_PINS.items()}

def all_off():
    for led in leds.values():
        led.value(0)

all_off()

# ─── Debounce ─────────────────────────────────────────────────────────────────
last_press = {c: 0 for c in COLORS}
DEBOUNCE_MS = 200

# ─── CALLBACK MQTT (PC → Pico) ────────────────────────────────────────────────
def commande_recu_callback(topic, msg):
    commande = msg.decode().strip()
    print("Commande reçue:", commande)

    if commande.startswith("SHOW:"):
        color = commande.split(":")[1].lower()
        all_off()
        if color in leds:
            leds[color].value(1)

    elif commande == "OFF":
        all_off()

# ─── WIFI ─────────────────────────────────────────────────────────────────────
def connect():
    global wlan
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(secrets.SSID, secrets.PWD)

    while not wlan.isconnected():
        print("En attente de connexion Wi-Fi...")
        utime.sleep(1)

    print("Connecté avec l'ip suivante:", wlan.ifconfig()[0])

# ─── MQTT ─────────────────────────────────────────────────────────────────────
def connect_mqtt():
    global client
    mac = wlan.config('mac')
    client_id = "PicoW_{:02x}{:02x}{:02x}".format(mac[3], mac[4], mac[5])

    client = MQTTClient(client_id, MQTT_BROKER, keepalive=60)
    client.set_callback(commande_recu_callback)
    client.connect()
    client.subscribe(TOPIC_CMD)
    print("Connecté au Broker MQTT avec ID:", client_id)

def publish(message):
    try:
        client.publish(TOPIC_PRESS, str(message))
    except Exception as e:
        print("Erreur publish MQTT:", e)
        try:
            connect_mqtt()
        except:
            pass

def check_mqtt():
    try:
        client.check_msg()
    except Exception as e:
        print("Erreur MQTT, reconnexion...", e)
        utime.sleep(2)
        if not wlan.isconnected():
            connect()
        try:
            connect_mqtt()
        except:
            pass

# ─── INIT ─────────────────────────────────────────────────────────────────────
connect()
connect_mqtt()
print("PICO_READY")

# ─── BOUCLE PRINCIPALE ────────────────────────────────────────────────────────
while True:
    now = utime.ticks_ms()

    check_mqtt()

    for color, btn in btns.items():
        if btn.value() == 1:
            if utime.ticks_diff(now, last_press[color]) > DEBOUNCE_MS:
                last_press[color] = now

                leds[color].value(1)
                utime.sleep_ms(80)
                leds[color].value(0)

                publish(f"PRESS:{color}")
                print(f"PRESS:{color}")

    utime.sleep_ms(10)