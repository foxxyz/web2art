Web2Art
=======

Capture screenshots of websites and display them on a Samsung Frame TV in "Art Mode"

_Note: This is an unofficial library and not supported or endorsed by Samsung_

Requirements
------------

 * Node 20+

Usage
-----

Example usage - fill in the IP of your TV and the url you want to capture:

```
./index.js --host 192.168.1.2 --url https://ivo.la
```

For all options see `node index.js --help`

Deployment
----------

The included deploy script in `/deploy/deploy.sh` can automate deployment. The default remote location is `/opt/web2art`

```
./deploy/deploy.sh -t <machine_ip>
```

### Systemd setup

Sample systemd service files are included in `deploy` for automating periodic execution of web2art.

1. Rename and modify the `.example.service` and `.example.timer` files and fill in the correct CLI arguments for your use case
2. Enable the service: `systemctl enable /opt/web2art/deploy/systemd/web2art.service`
3. Enable the systemd timer: `systemctl enable /opt/web2art/deploy/systemd/web2art.timer`
4. Start the timer: `systemctl start web2art.timer`

License
-------

GPL v3
