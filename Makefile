NODE = docker-compose exec -T node

all:

.PHONY: test
test:
	$(NODE) npm test
