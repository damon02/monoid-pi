mon_nic_status="$(cat /sys/class/net/eth0/operstate)"
br_nic_status="$(cat /sys/class/net/br0/operstate)"

cpu_temp="$(grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100 / ($2+$4+$5)} END {print usage}')"
cpu_usage="$(grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100 / ($2+$4+$5)} END {print usage}')"
file_usage="$(df -h | grep /dev/root | awk '{ print $5 }')"
#not sure if bash can handle / and *
ram_usage_1="$(free -m | awk '/Mem:/ { print $3 }')"
ram_usage_2="$(free -m | awk '/Mem:/ { print $2 }')"


echo {'"sys_data"':{'"nic"':{'"mon_nic"':{'"status"':"\""${mon_nic_status}"\""} ,'"br_nic"':{'"status"':"\""${br_nic_status}"\""}},'"cpu_temp"':"\""${cpu_temp}"\"",'"cpu_usage"':"\""${cpu_usage}"\"",'"file_usage"':"\""${file_usage}"\"",'"ram_usage_1"':"\""${ram_usage_1}"\"",'"ram_usage_2"':"\""${ram_usage_2}"\""}}