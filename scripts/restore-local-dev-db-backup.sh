set -e
db_container_id=$(docker ps -aqf "name= txty-db-1")
docker exec -i $db_container_id psql -U postgres -c "drop database txty_development"
docker exec -i $db_container_id psql -U postgres -c "create database txty_development"
cat $1 | docker exec -i $db_container_id psql -U postgres -d txty_development
