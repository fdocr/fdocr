---
title: "Martilla - A simple backup tool for simple everyday use"
date: 2019-10-20 12:00:00 -0600
tags: ["martilla", "cli", "backups", "automation", "postgres", "mysql"]
permalink: /martilla-tool-for-db-backups/
---

[Martilla](https://github.com/fdoxyz/martilla) is a project I've been working on recently. It's a CLI tool to help automate database backups. It's main objectives are to remain modular, configurable and simple to understand.

I was heavily inspired by the successful [Backup](https://github.com/backup/backup) project. The way they mix & match database engines, storage solutions, notifiers and other utilities made me a user of them. In the last couple of years support has decreased though, so I'm decided to work with this simplified concept (also to replace the DSL with a ruby-agnostic config file).

## Installation & the configuration file

You'll need [Ruby installed](https://www.ruby-lang.org/en/documentation/installation) on your machine to get started. I'd highly recommend using a [version manager](https://www.ruby-lang.org/en/documentation/installation/#managers)

    $ gem install martilla
    $ martilla setup backup-config.yml

That's it! You now have Martilla working and a sample configuration file that looks like this

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
notifiers:
- type: none
```

## Customize the config file

Let's say we have a Postgres database and we want backups stored on a S3 bucket at midnight everyday. You'll of course have to modify the `db` directive with your database details, but also replace the default `storage` details

```yaml
storage:
  type: s3
  options:
    bucket: sideproject_backups
    filename: backup.sql
    region: 'us-east-1'
    access_key_id: XXXXXXXX
    secret_access_key: YYYYYYYY
```

Once configured test your database backup to make sure it works as expected

    $ martilla backup backup-config.yml

If everything's working fine all you need is to add this command to your crontab to run at midnight everyday. You've just automated database backups to S3!

In case you hate writing to crontab directly like me, check out the [whenever](https://github.com/javan/whenever) gem if you haven't already.

## Get notified

It's good to have backups run consistently, but it might be just as important to get notified when they fail.

Good news are that if we want an **email notification** to be sent and also a **Slack notification** we don't have to settle with just one or the other. Replace the `type: none` notifier from the sample configuration with the following:

```yaml
notifiers:
- type: 'slack'
  options:
    slack_channel: '#backups'
    slack_webhook_url: https://hooks.slack.com/services/XXXXX/YYYYY/ZZZZZ
- type: ses
  options:
    from: backups@my_domain.com
    to: fernando@visualcosita.com
    region: 'us-east-1'
    access_key_id: XXXXXXXX
    secret_access_key: YYYYYYYY
```

The notifiers tag in the config file is an array, so you can add as many notifiers as you want. This means even multiple Slack notifications to different webhooks, just continue to chain notifiers on the list.

Now if a problem happens and your backup fails you'll have visibility of it right away!

## Hacktoberfest

Thanks to [Hacktoberfest](https://hacktoberfest.digitalocean.com/) we got [our first contribution](https://github.com/fdoxyz/martilla/pull/2) and that's how we have Slack notification support!

If you're looking for a Ruby project to contribute during this last stretch of "hacktober" take a look at [our open issues](https://github.com/fdoxyz/martilla/issues). I'll be happy to guide you through questions you might have.

## Conclusions

Martilla is meant to be a "simple backup tool for simple everyday use". High throughput and larger databases (probably > 50GB in size) will likely benefit more from backup solutions provided by most managed database services in the likes of [AWS RDS](https://aws.amazon.com/rds/).

For smaller deployments and side projects this might be an interesting addition to your toolbelt. For future releases I'm thinking of features like more integrations (databases, storages and notifiers), a command to automatically restore a backup and more customizable options.

That's it for now though, I hope this was helpful and check out our [GitHub repo](https://github.com/fdoxyz/martilla) for more in-depth usage details. Pura vida!
