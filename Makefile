test:
	@./node_modules/.bin/mocha \
		--reporter spec \
		--bail \
		--timeout 5s \
		--require test/_common.js

clean-repl:
	@if [ -d pids ]; then rm -f pids/*; fi
	@find $(TMPDIR) -maxdepth 1 -type s -name node-repl-*.sock -delete

.PHONY: test
.PHONY: clean-repl
