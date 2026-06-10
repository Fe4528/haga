# Discord message scraper with web ui<br/>(with useless classes for no reason)
svber/halosviel wanted a picture
<img width="1238" height="784" alt="image" src="https://github.com/user-attachments/assets/5a04a796-39e6-4a94-acb6-c2c7bfce9c3f" />

## Sample structure of results folder as follows:

```
results (folder in the curent directory)
  └── 109832483 (save timestamp or "session ID" that contains the servers logged during that time)
          ├── 10001 (a guild)
          |     ├── 20001 (a channel)
          |     |     └── history.jsonl (contains the messages in a channel)
          |     ├── 20002 (another channel)
          |     └── channels.jsonl (contains basic channel data)
          └── servers.jsonl (contains basic server info)
```

# How to install and run
This project is against Discord TOS, so try at your own risk

1. Download this as zip then go to the folder
2. Open terminal and run `npm update` to install dependencies
3. Create a folder named "results" in the current directory
4. Get your account token
5. Put your account token in config.json
6. On your open terminal (when you did step 2), run `node .`
7. To stop, press "K" key

# How to run again
1. Open terminal in current folder
2. Run `node .`
3. Same routine for stopping, press "K" key

# What is a JSONL file?
It is basically just JSON per line, like this:
```json
{ "item here": "value" },
{ "another item here": "another value" }

... and more items as needed
```

# How to view the messages?
Make your own viewer

## servers.jsonl content:
```json
{
  "guild_name": "Guild/Server name",
  "guild_id": "Guild ID",
  "path":"./results/save_timestamp/guild_id/"
}
```
## channels.jsonl content:
```json
{
  "channel_name": "Channel name",
  "channel_id": "Channel ID",
  "path":"./results/save_timestamp/guild_id/channel_id/"
}
```
## history.jsonl content:
```json
{
  "guild_name":"Guild/Server Name",
  "channel_name": "Channel Name",
  "timestamp": "Message sent timestamp",
  "attachments": [
      {
        "name": "image.png",
        "url": "https://cdn.discordapp.com/",
        "proxy_url": "https://media.discordapp.net/"
      }
  ],
  "stickers": [
      {
        "name": "sticker name",
        "url": "sticker URL",
        "tags": "sticker tags"
      }
  ] ,
  "username": "Username",
  "nickname": "User nickname in a server",
  "display_name": "User display name",
  "content": "Message content goes here",
  "user_id": "User ID"
}
```
