# Customization Museum

An initiative to archive all themes, skins and add-ons for old customizable programs in an easily searchable way and backed up on the Wayback Machine.

Files are archived automatically and not checked; scan anything you download. Report a bad item or issues with an item using the Report link on its card.

Browse: https://melo-foundation.github.io/customization-museum/

Request a URL or a whole program: https://github.com/melo-foundation/customization-museum/issues/new/choose. Saves run once a maintainer adds the `approved` label.

```
python3 scrape.py miranda adium     # data/<app>.json
python3 archive.py check            # find existing Wayback snapshots
python3 archive.py save [N] [W]     # Save Page Now for the rest (.archive-keys = ACCESS:SECRET)
python3 build.py                    # entries.json
```
