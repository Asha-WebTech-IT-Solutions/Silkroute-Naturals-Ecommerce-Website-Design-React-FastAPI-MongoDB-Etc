"""SMTP mail notifications for Silkroute Naturals.

Reads SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, SMTP_FROM_NAME,
FRONTEND_URL from env. If SMTP_HOST is empty, all sends are skipped silently
(the app continues to function — emails are simply queued in logs).
"""
import os
import ssl
import smtplib
import logging
from email.message import EmailMessage
from email.utils import formataddr

logger = logging.getLogger("silkroute.mailer")

BRAND_NAME = "Silkroute Naturals"
GOLD = "#B5955C"
IVORY = "#F9F6F0"
SAND = "#F1EBE1"
CHARCOAL = "#2C2A26"


def _config():
    return {
        "host": os.environ.get("SMTP_HOST", "").strip(),
        "port": int(os.environ.get("SMTP_PORT", "587") or 587),
        "user": os.environ.get("SMTP_USER", ""),
        "password": os.environ.get("SMTP_PASSWORD", ""),
        "from_email": os.environ.get("SMTP_FROM", "no-reply@silkroutenaturals.com"),
        "from_name": os.environ.get("SMTP_FROM_NAME", BRAND_NAME),
        "use_tls": os.environ.get("SMTP_USE_TLS", "true").lower() != "false",
    }


def is_configured() -> bool:
    cfg = _config()
    return bool(cfg["host"] and cfg["user"] and cfg["password"])


def _wrap(content_html: str, preheader: str = "") -> str:
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>{BRAND_NAME}</title></head>
<body style="margin:0;padding:0;background:{SAND};font-family:Georgia,serif;color:{CHARCOAL};">
<span style="display:none;max-height:0;overflow:hidden;color:{SAND};">{preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{SAND};padding:40px 0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:{IVORY};">
      <tr><td style="padding:36px 48px;border-bottom:1px solid #E2D9CD;text-align:center;">
        <div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:{GOLD};font-family:Helvetica,Arial,sans-serif;">Silkroute · Naturals</div>
        <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:36px;letter-spacing:-0.5px;margin-top:8px;color:{CHARCOAL};">Silkroute</div>
      </td></tr>
      <tr><td style="padding:48px;">{content_html}</td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #E2D9CD;color:#5B564E;font-size:11px;font-family:Helvetica,Arial,sans-serif;letter-spacing:0.04em;">
        Silkroute Naturals · Indiranagar, Bengaluru<br/>
        +91 7406 995 999 · hello@silkroutenaturals.com
      </td></tr>
    </table>
  </td></tr>
</table></body></html>"""


def _send(to_email: str, subject: str, html: str, preheader: str = "") -> bool:
    cfg = _config()
    if not is_configured():
        logger.info("[mailer:noop] To=%s Subject=%s (SMTP not configured)", to_email, subject)
        return False
    msg = EmailMessage()
    msg["From"] = formataddr((cfg["from_name"], cfg["from_email"]))
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(_strip_html(html))
    msg.add_alternative(_wrap(html, preheader), subtype="html")
    try:
        if cfg["port"] == 465:
            ctx = ssl.create_default_context()
            with smtplib.SMTP_SSL(cfg["host"], cfg["port"], context=ctx, timeout=15) as s:
                s.login(cfg["user"], cfg["password"])
                s.send_message(msg)
        else:
            with smtplib.SMTP(cfg["host"], cfg["port"], timeout=15) as s:
                if cfg["use_tls"]:
                    s.starttls(context=ssl.create_default_context())
                s.login(cfg["user"], cfg["password"])
                s.send_message(msg)
        logger.info("[mailer] sent to=%s subject=%s", to_email, subject)
        return True
    except Exception as e:
        logger.error("[mailer] failed to=%s err=%s", to_email, e)
        return False


def _strip_html(html: str) -> str:
    import re
    return re.sub(r"<[^>]+>", "", html)


def _btn(label: str, href: str) -> str:
    return f'<a href="{href}" style="display:inline-block;background:{CHARCOAL};color:{IVORY};padding:14px 28px;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;">{label}</a>'


# ---------- Templated emails ----------

def send_welcome(email: str, name: str):
    html = f"""
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:32px;margin:0 0 16px;line-height:1.1;">Welcome, {name}.</h1>
<p style="line-height:1.7;color:#5B564E;">Thank you for joining the Silkroute. You'll now receive small, considered notes from our atelier — new harvests, journal pieces, invitations to taste.</p>
<p style="margin-top:28px;">{_btn("Browse the Collection", os.environ.get("FRONTEND_URL", "https://silkroutenaturals.com") + "/shop")}</p>
"""
    return _send(email, "Welcome to Silkroute", html, "A small note from our atelier")


def send_order_confirmation(email: str, name: str, order: dict):
    items_html = "".join(
        f'<tr><td style="padding:10px 0;border-bottom:1px solid #E2D9CD;font-family:Helvetica,Arial,sans-serif;font-size:13px;">{it["name"]} × {it["quantity"]}</td>'
        f'<td style="padding:10px 0;border-bottom:1px solid #E2D9CD;text-align:right;font-family:Helvetica,Arial,sans-serif;font-size:13px;">₹{int(it["line_total"]):,}</td></tr>'
        for it in order.get("items", [])
    )
    addr = order.get("shipping_address", {}) or {}
    html = f"""
<div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:{GOLD};font-family:Helvetica,Arial,sans-serif;">Order confirmed</div>
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:32px;margin:8px 0 4px;line-height:1.1;">Thank you, {name}.</h1>
<p style="font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.04em;color:#5B564E;margin:0 0 24px;">Order #{order["order_number"]}</p>
<table role="presentation" width="100%" style="border-top:1px solid #E2D9CD;border-collapse:collapse;">{items_html}
<tr><td style="padding:14px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;">Subtotal</td><td style="padding:14px 0;text-align:right;font-family:Helvetica,Arial,sans-serif;font-size:13px;">₹{int(order["subtotal"]):,}</td></tr>
{('<tr><td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:'+GOLD+';">Discount</td><td style="padding:6px 0;text-align:right;color:'+GOLD+';font-family:Helvetica,Arial,sans-serif;font-size:13px;">− ₹'+str(int(order["discount"]))+'</td></tr>') if order.get("discount") else ""}
<tr><td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;">Shipping</td><td style="padding:6px 0;text-align:right;font-family:Helvetica,Arial,sans-serif;font-size:13px;">{('₹'+str(int(order["shipping"]))) if order.get("shipping") else "Free"}</td></tr>
<tr><td style="padding:14px 0;border-top:1px solid #E2D9CD;font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;">Total</td><td style="padding:14px 0;border-top:1px solid #E2D9CD;text-align:right;font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;">₹{int(order["total"]):,}</td></tr>
</table>
<p style="margin-top:28px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#5B564E;line-height:1.7;">Shipping to:<br/>
{addr.get("line1", "")}<br/>{addr.get("line2", "") + "<br/>" if addr.get("line2") else ""}{addr.get("city", "")}, {addr.get("state", "")} — {addr.get("pincode", "")}</p>
<p style="margin-top:28px;">{_btn("View Order", os.environ.get("FRONTEND_URL", "https://silkroutenaturals.com") + "/account")}</p>
"""
    return _send(email, f"Order confirmed — #{order['order_number']}", html, "Your harvest is on its way")


def send_order_status(email: str, name: str, order_number: str, status: str):
    titles = {
        "shipped": "Your order is on its way",
        "delivered": "Your order has arrived",
        "cancelled": "Your order has been cancelled",
        "confirmed": "Your order is confirmed",
    }
    title = titles.get(status, "Order update")
    html = f"""
<div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:{GOLD};font-family:Helvetica,Arial,sans-serif;">Order update</div>
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:32px;margin:8px 0 4px;line-height:1.1;">{title}.</h1>
<p style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#5B564E;margin:0 0 24px;letter-spacing:0.04em;">Order #{order_number} · status now <strong style="color:{CHARCOAL};">{status}</strong></p>
<p style="line-height:1.7;color:#5B564E;">Dear {name}, we wanted to keep you in the loop.</p>
<p style="margin-top:28px;">{_btn("View Order", os.environ.get("FRONTEND_URL", "https://silkroutenaturals.com") + "/account")}</p>
"""
    return _send(email, f"{title} — #{order_number}", html)


def send_password_reset(email: str, reset_link: str):
    html = f"""
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:32px;margin:0 0 16px;line-height:1.1;">Reset your password.</h1>
<p style="line-height:1.7;color:#5B564E;">We received a request to reset your Silkroute password. Tap below to choose a new one. The link is valid for one hour.</p>
<p style="margin-top:28px;">{_btn("Reset Password", reset_link)}</p>
<p style="margin-top:32px;font-size:12px;color:#5B564E;">If you didn't request this, you may ignore this email — your password remains unchanged.</p>
"""
    return _send(email, "Reset your Silkroute password", html, "Reset link valid for 1 hour")


def send_booking_received(email: str, name: str, booking: dict):
    html = f"""
<div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:{GOLD};font-family:Helvetica,Arial,sans-serif;">Reservation received</div>
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:32px;margin:8px 0 16px;line-height:1.1;">Thank you, {name}.</h1>
<p style="line-height:1.7;color:#5B564E;">We have received your reservation for the Silkroute Experience Center.</p>
<table style="margin-top:20px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#5B564E;">
<tr><td style="padding:6px 0;">Date</td><td style="padding:6px 0 6px 32px;color:{CHARCOAL};">{booking.get("visit_date")}</td></tr>
<tr><td style="padding:6px 0;">Time</td><td style="padding:6px 0 6px 32px;color:{CHARCOAL};">{booking.get("visit_time")}</td></tr>
<tr><td style="padding:6px 0;">Experience</td><td style="padding:6px 0 6px 32px;color:{CHARCOAL};text-transform:capitalize;">{booking.get("experience_type")}</td></tr>
<tr><td style="padding:6px 0;">Party size</td><td style="padding:6px 0 6px 32px;color:{CHARCOAL};">{booking.get("party_size")}</td></tr>
</table>
<p style="margin-top:24px;line-height:1.7;color:#5B564E;">A member of our team will confirm shortly. We're at 100 Ft Road, Indiranagar, Bengaluru.</p>
"""
    return _send(email, "Your reservation at Silkroute", html)
