# Customization Museum

Themes, skins and add-ons for old customizable programs, every file backed up on the Wayback Machine.

Browse: https://melo-foundation.github.io/customization-museum/

Request a URL or a whole program: https://github.com/melo-foundation/customization-museum/issues/new/choose. Saves run once a maintainer adds the `approved` label.

```
python3 scrape.py miranda adium     # data/<app>.json
python3 archive.py check            # find existing Wayback snapshots
python3 archive.py save [N] [W]     # Save Page Now for the rest (.archive-keys = ACCESS:SECRET)
python3 build.py                    # entries.json
```
