---
next:
  text: Best practices
  link: /guide/user-manual/best-practices
---

# Phone upload setup

Phone upload lets someone send audio from a **phone or tablet** (cellular or rink Wi‑Fi) into IceTrackVault on the competition PC. Traffic reaches your computer through a **Cloudflare named tunnel** and a dedicated **HTTPS hostname** you control.

Configure this **once per music PC**, then use **Upload from phone** whenever you upload tracks to a project or stored collection. See [Best practices](./best-practices#phone-upload-set-up-early) for timing: set up and test well before the event.

## What you need

- A **Cloudflare** account with a domain (or subdomain) you can route through a tunnel.
- The **`cloudflared`** CLI installed on the same Windows or Linux computer that runs IceTrackVault, on your PATH.
- A **public HTTPS origin** (hostname only) that points at your tunnel—for example `https://upload.yourclub.org` (no path after the hostname).

IceTrackVault listens on **127.0.0.1** on a **local port** (default **38444**). Your Cloudflare tunnel must forward that hostname to `http://localhost:38444` unless you change the port in both places.

## Install cloudflared

On the music computer:

1. Install from [Cloudflare tunnel downloads](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/). On Windows you can also run:
   ```powershell
   winget install Cloudflare.cloudflared
   ```
   On Linux, install the `cloudflared` package from that page and ensure it is on your PATH.
2. Open a **new** terminal so PATH updates, then confirm `cloudflared` runs.

In IceTrackVault, open **View → Phone upload setup…** and click **Check cloudflared install** to verify the app can find it.

## Create the Cloudflare tunnel

These steps happen in the [Cloudflare dashboard](https://one.dash.cloudflare.com/) (Zero Trust / Networking → Tunnels). Exact labels may change; the goal is a **named tunnel** with a **published route** to your PC.

1. Create a **new tunnel** (Cloudflare One connector).
2. Add a **public hostname** (your upload subdomain) and set the **Service URL** to:
   `http://localhost:38444`
   (or `http://localhost:PORT` if you will use a different local port in IceTrackVault).
3. Copy the **tunnel run token** from Cloudflare’s install command (the long token passed to `cloudflared tunnel run --token …`).

Use a **dedicated subdomain** for uploads—not your main website. Keep the tunnel token **secret**; IceTrackVault stores it locally on this PC.

## Configure IceTrackVault

Open **View → Phone upload setup…**

1. **Local port** — default `38444`. If that port is already in use on the PC, pick another (1024–65535), click **Test local port**, and set the **same** Service URL in Cloudflare (`http://localhost:NEWPORT`).
2. **Public origin** — your HTTPS hostname only, e.g. `https://upload.yourclub.org`. Must use `https://` and must not include a path.
3. **Tunnel run token** — paste the token from Cloudflare (or **Replace token…** if one is already saved).
4. Turn on **Enable upload from phone**.
5. Run the checks:
   - **Check cloudflared install**
   - **Test local port**
   - **Test tunnel path** — briefly starts `cloudflared` and verifies the public URL end-to-end (can take up to about a minute; no file is uploaded).
6. Click **Save**.

Upload from phone is **ready** when enable is on, the origin is valid, and a tunnel token is saved. If **Upload from phone** does not appear in upload dialogs, reopen **Phone upload setup…** and confirm all three.

<figure class="screenshot-box">
  <img
    src="/screenshots/phone-upload-setup.png"
    alt="Phone upload setup dialog with port, origin, token, and test buttons"
    data-zoomable
  />
  <figcaption><strong>View → Phone upload setup…</strong> — local port, public origin, tunnel token, enable switch, and connection tests.</figcaption>
</figure>

## Using phone upload at the rink

When setup is ready:

- **Project → Upload track to project…** — choose **Upload from phone**. IceTrackVault starts a short-lived session and shows a **QR code** and **session link** (`https://your-host/s/…`).
- The same option appears when **replacing** a track file and when uploading to a **stored collection**.

On the phone, scan the QR code or open the link, then select one or more audio files. Files are added to the project or collection when the upload completes.

**Session links are temporary.** Each upload flow gets a new link. Anyone with the link can upload while that session is open—do not post session URLs publicly.

## Troubleshooting

| Symptom | Things to check |
|--------|-------------------|
| **cloudflared not found** | Install `cloudflared`, restart IceTrackVault, use **Check cloudflared install**. |
| **Port not available** | Another app is using the port; change local port and update Cloudflare Service URL to match. |
| **Tunnel path test fails** | Token correct, Service URL matches local port, hostname DNS routed through the tunnel. Read error text from **Test tunnel path**. |
| **No “Upload from phone” in dialog** | **Enable upload from phone** off, missing token, or invalid origin—check **Phone upload setup…** and save again. |

For late-upload workflow after files arrive, see [Solutions for common situations](./common-situations).

## What to read next

- [Best practices](./best-practices) — backups, lock modes, and testing phone upload before competition day.
- [User manual introduction](./index) — full table of contents.
