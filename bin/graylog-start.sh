 #!/usr/bin/env bash
cd "$(dirname "$0")"
cp ./conf/collector.conf /etc/graylog/collector/collector.conf -v
sudo chmod 777 /etc/graylog/collector -R
sudo stop graylog-collector
sudo start graylog-collector
