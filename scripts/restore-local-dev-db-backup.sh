set -e
db_container_id=$(docker ps -aqf "name= texterify-db-1")
docker exec -i $db_container_id psql -U postgres -c "drop database texterify_development"
docker exec -i $db_container_id psql -U postgres -c "create database texterify_development"
cat $1 | docker exec -i $db_container_id psql -U postgres -d texterify_development
