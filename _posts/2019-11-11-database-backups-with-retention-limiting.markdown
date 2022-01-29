---
title: "PostgreSQL backups to S3 with retention limits"
date: 2019-11-11 00:30:00 -0600
tags: ["Martilla", "CLI", "Ruby", "Backups", "PostgreSQL", "MySQL", "AWS", "S3", "Database"]
permalink: /database-backups-with-retention-limiting/
---

This is a bit of an update on the latest version of [Martilla](https://github.com/fdoxyz/martilla). The feature introduced that I'm more excited about is the ability to limit the retention of your backups.

This will be a walkthrough on how to backup a PostgreSQL DB to AWS S3 and easily enforce a retention limit. [This other blog post](/martilla-tool-for-db-backups) gives an introduction to the CLI tool used.

## Objective

Daily backups with a retention period of one week. This can be easily adapted to 3 backups per day + 1 month retention, or other any other combination desired.

For the sake of the walkthrough we'll stick to the simple daily backups with 7 day retention example.

## Prerequisites

A working Ruby installation, a PostgreSQL database to backup and the [Martilla](https://github.com/fdoxyz/martilla) CLI tool

```sh
$ gem install martilla
```

## The config file

Create a sample config file

```sh
$ martilla setup backup-config.yml
```

The sample config file will look similar to the following

```yaml
---
db:
  type: postgres
  options:
    host: localhost
    user: username
    password: password
    db: databasename
storage:
  type: local
  options:
    filename: database-backup.sql
    retention: 0
notifiers:
- type: none
```

## Database

The default database type is already **postgres**, although the same configuration options would work with a **mysql** alternative.

If we're exporting the backups from the same machine/VM that's hosting the PostgreSQL server we can actually remove options we don't need. Let's make the `db` directive look like the following snippet

```yaml
db:
  type: postgres
  options:
    db: my_db
```

The `host` will default to `localhost` and we'll set both the user & password as ENV variables.

```sh
$ export PG_USER="my_db_user"
$ export PG_PASSWORD="my_db_password"
```

## Storage

AWS S3 has quite a few configurable options ([full list here](https://github.com/fdoxyz/martilla#storages)), but we can make use of ENV variables for sensitive data again. The `storage` directive needs to look like the following snippet

```yaml
storage:
  type: s3
  options:
    bucket: my_side_project
    filename: backups/backup.sql
    region: 'us-west-2'
    retention: 7
```

All options have pretty straightforward names except for `retention`. This option is how Martilla knows when it should remove 'stale' backups that you no longer want to keep.

The `retention` option represents the maximum number of backups you're willing to keep at any given moment. In this case we're looking for daily backups and we want to hold on to them for no longer than a week. We have no need to keep them for any longer so we can save storage space by getting rid of them at that point. Simple as setting the `retention` option to `7`.

Other valid scenarios include:
* Backups every 4h but we're only interested on the most up to date version would work with retention set to 1 to keep only the latest backup dumped.
* Weekly backups without any retention limit, they're all important to keep. This can be achieved with using the default value of 0 (no retention limit is set).

Don't forget to set your AWS credentials using ENV variables. If you're on AWS you can use IAM roles by not setting the ENV variables too.

```sh
$ export AWS_ACCESS_KEY_ID="my_access_key"
$ export AWS_SECRET_ACCESS_KEY="my_secret_key"
```

## Notifications / Alerts

Get notified when the backups are dumped successfully or alerted when they fail. Avoid feeling like a fool if you ever happen to need them and realize your backups hadn't been stored correctly for weeks.

The following `notifiers` directive sends you a Slack notification on a specific channel (learn about Slack webhooks [here](https://api.slack.com/messaging/webhooks))

```yaml
- type: 'slack'
  options:
    slack_channel: '#backups'
    slack_webhook_url: https://hooks.slack.com/services/TTSAMPLEPO/BWEBHOOKOQ/NDQLOLAMSKDMLOLASROFLMDLA
```

There's also SMTP, AWS SES and other email notifiers you can configure. If you rather only get notified when the backups are failing set `send_success` & `send_failure` as options with `true`/`false` values.

For more details on all the available options check [the docs](https://github.com/fdoxyz/martilla#notifiers.)

## Test it out!

```sh
$ martilla backup backup-config.yml
```

You should be able to see the backup appear in your S3 bucket within the backups directory. Martilla adds a timestamp by default to differentiate from each run.

Try executing this command multiple times, and you should eventually see that no more than 7 backups stored... That's the retention limit working!

## Cron

The [ol'reliable](https://www.youtube.com/watch?v=4dFgGp8Bfoo) Cron, for running your backups. The correct usage of Cron or even alternatives to Cron aren't within the scope of this post. The following is just an oversimplified example that works for this scenario.

Start by editing your crontab file

```sh
$ crontab -e
```

and add this line to it

```sh
0 23 * * * /bin/bash -l -c 'martilla backup /path/to/backup-config.yml'
```

[We did it!](https://youtu.be/SBCw4_XgouA?t=5) We now have daily backups of a PostgreSQL database that will be retained for 7 days.

Your config file should now look like this:

```yaml
---
db:
  type: postgres
  options:
    db: my_db
storage:
  type: s3
  options:
    bucket: my_side_project
    filename: backups/backup.sql
    region: 'us-west-2'
    retention: 7
notifiers:
- type: 'slack'
  options:
    slack_channel: '#backups'
    slack_webhook_url: https://hooks.slack.com/services/TTSAMPLEPO/BWEBHOOKOQ/NDQLOLAMSKDMLOLASROFLMDLA
```

## Conclusions

Martilla is a very young project and I'm striving to keep it reliable & easy to configure for simple use cases. [Bug reports](https://github.com/fdoxyz/martilla/issues) and any other type of feedback/contribution is greatly appreciated!

Hope I can write about a new set of features soon (aiming for a backup restoration command). Pura Vida!
