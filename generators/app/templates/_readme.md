# <%= readableName %>

## Features

## Getting Started

## FAQ
### gulp watch error (ENOSPC)
It looks like is related to the number of files you are watching (`inotify` max file watches problem). In linux you fix 
this with the command:

    echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

## License

[MIT](http://opensource.org/licenses/MIT)
