# YouSubs

Yousubs is here to make it easier going through all the youtube
subscription notification emails. Reduce all those click to just
a setup and global shortcuts. Best suited for listening to music 
when gaming or programming.

This application requires you to have multiple subscriptions to 
various youtube channels for which you receive upload emails in
order to keep feeding it. 

## Legend

- [Features](#Features)
- [Installation](#Installation)
- [Usage](#usage)
- [How it works](#how-it-works)


## Features

- Loads and plays youtube emails from your mail account.
- Cleans emails that you listened to.
- Adds global shortcuts for liking, skipping and forwarding so you 
can play or do other things meanwhile listening.
- Keeps track of most liked channels based on liked videos.
- Keeps history of played tracks.
- Skips tracks that have been removed.
- Optional IDLE pause so that you don't miss any tracks.

![demo](https://raw.githubusercontent.com/archfz/yousubs/master/misc/demo.png)

## Installation

0. The following packages are required on linux: 
`xserver-xorg-dev libxext-dev libxss-dev xscreensaver`

1. Install node if you don't already have it [https://nodejs.org/en/](https://nodejs.org/en/)
2. Install yousubs by running in a shell ``npm install -g yousubs``

## Usage

1. Open a shell and run ``yousubs``. This will start a server
and open the application in your primary browser.
2. Create an account on the opened page with a gmail account that
has youtube subscription mails.
3. Login and enjoy.

## How it works

This package comes with two parts: an application for hosting a website locally on your computer
and a command line tool that connects to your gmail client to fetch emails for youtube. The website
manages the storage and login for your account. On the main page it uses sockets to seamlessly
communicate with the backend and bring in the next song to play. A special global keypress watch is
also started when the server starts and the socket is created, so that you can skip, like or 
forward easily from anywhere.

All history and likes of songs are stored globally on you computer and they persist indefinitely.
This tool requires API access to your gmail account. The provided API token is stored securely by
encrypting it with the password that you provided on registration.
