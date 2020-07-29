# Sacramento campaign finance alert scraper

[Sacramento city](https://public.netfile.com/pub2/Default.aspx?aid=SAC) and [the county]() publish campaign finance data. This checks the RSS feeds for new filings (they disappear after a certain amount of time), checks them against a Google spreadsheet, and adds it if the filing doesn't yet exist. The spreadsheet is set up to send me an email whenever there's new data added.

## Usage

The main command is `node check-filings.js`.

I run the following script on my local computer every few minutes. I personally use `launchctl` to run it on the interval, but 🤷‍♂️.

```
echo "Running at $(date "+%c")"
/Users/JeremiaKimelman/.nvm/versions/node/v14.4.0/bin/node check-filings.js
```