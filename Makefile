# ──────────────────────────────────────────────────────────────────────
# Deo Gratias Catalog — Makefile
# ──────────────────────────────────────────────────────────────────────
SHELL       := /bin/bash
NODE        := node
NPM         := npm
PORT        := 3015
PID_FILE    := .server.pid
SRC_FILES   := server.js config.js lib/**/*.js public/js/*.js public/css/*.css

# ── Default ────────────────────────────────────────────────────────────
.DEFAULT_GOAL := help

## ── Development ────────────────────────────────────────────────────────

.PHONY: install
install: ## Install dependencies
	$(NPM) install

.PHONY: dev
dev: ## Start dev server with auto-reload (foreground)
	$(NPM) exec -- nodemon server.js

.PHONY: start
start: ## Start server in background
	@node server.js & echo $! > .server.pid && echo "Deo Gratias Catalog started  -> http://localhost:${PORT}"

.PHONY: stop
stop: ## Stop the background server
	@bash scripts/server.sh stop

.PHONY: restart
restart: ## Restart the server
	@bash scripts/server.sh restart

.PHONY: port-kill
port-kill: ## Kill any process occupying the configured port ($(PORT))
	@PID=$$(lsof -ti tcp:$(PORT) 2>/dev/null); \
	if [ -n "$$PID" ]; then \
		echo "  Killing process $$PID on port $(PORT)…"; \
		kill -9 $$PID 2>/dev/null; \
		echo "  Done"; \
	else \
		echo "  Port $(PORT) is free"; \
	fi

.PHONY: upload
upload: ## Upload local images to Cloudinary (make upload [DIR=./my-images])
	$(NODE) scripts/upload-to-cloudinary.js $(DIR)

.PHONY: build
build: ## Build Docker image
	docker build -t deo-gratias-catalog .

.PHONY: docker-up
docker-up: ## Start server with Docker Compose
	docker compose up -d --build

.PHONY: docker-down
docker-down: ## Stop Docker Compose services
	docker compose down

## ── Testing ───────────────────────────────────────────────────────────

.PHONY: test
test: ## Run Playwright tests (server auto-starts)
	$(NPM) exec -- playwright test

.PHONY: test-ui
test-ui: ## Run Playwright tests in headed mode
	$(NPM) exec -- playwright test --headed

.PHONY: test-report
test-report: ## Show last Playwright test report
	$(NPM) exec -- playwright show-report

.PHONY: test-api
test-api: ## Smoke-test the live API endpoints (server must be running)
	@echo ""
	@echo "  ── GET /api/images ──"
	@curl -sf http://localhost:$(PORT)/api/images > /tmp/temoin-test.json 2>/dev/null && \
		$(NODE) -e "const j=JSON.parse(require('fs').readFileSync('/tmp/temoin-test.json','utf8'));console.log('  Total images:',j.total);j.images.forEach(i=>console.log('   ',i.filename,'→',i.name))" || \
		echo "  ERROR: server not responding on port $(PORT) — run 'make start' first"
	@echo ""
	@echo "  ── POST /api/generate-pdf ──"
	@curl -sf -X POST http://localhost:$(PORT)/api/generate-pdf > /tmp/temoin-test-pdf.json 2>/dev/null && \
		$(NODE) -e "const j=JSON.parse(require('fs').readFileSync('/tmp/temoin-test-pdf.json','utf8'));console.log('  PDF:',j.success?'OK':'FAIL',j.downloadUrl||j.error||'')" || \
		echo "  ERROR: PDF endpoint not responding on port $(PORT)"
	@echo ""

.PHONY: test-images
test-images: ## Generate placeholder test images in ./images
	$(NODE) scripts/create-test-images.js

## ── Code quality ──────────────────────────────────────────────────────

.PHONY: format
format: ## Auto-format source files with Prettier
	$(NPM) exec -- prettier --write $(SRC_FILES)

.PHONY: format-check
format-check: ## Check formatting without writing (CI-friendly)
	$(NPM) exec -- prettier --check $(SRC_FILES)

.PHONY: lint
lint: ## Run ESLint on server-side code
	$(NPM) exec -- eslint . --ext .js

.PHONY: scan-secrets
scan-secrets: ## Scan for hard‑coded secrets using Gitleaks
	npx --yes gitleaks detect --source=.

.PHONY: check
check: format-check lint ## Run all checks (format + lint)

.PHONY: review
review: format lint scan-secrets
	@echo "All checks passed."

.PHONY: audit
audit: ## Run npm security audit
	$(NPM) audit --omit=dev

.PHONY: audit-fix
audit-fix: ## Attempt to auto-fix audit vulnerabilities
	$(NPM) audit fix --omit=dev

## ── PDF ───────────────────────────────────────────────────────────────

.PHONY: pdf
pdf: ## Generate the PDF catalog (standalone, no server needed)
	@mkdir -p output
	@$(NODE) -e " \
		const {generatePDF}=require('./lib/pdf-generator'); \
		const fs=require('fs'),path=require('path'); \
		const dir='./images'; \
		if(!fs.existsSync(dir)){console.error('  No ./images directory');process.exit(1)}; \
		const files=fs.readdirSync(dir).filter(f=>/\.(jpe?g|png|webp)$$/i.test(f)); \
		if(!files.length){console.error('  No images found');process.exit(1)}; \
		const imgs=files.sort().map(f=>({ \
			filename:f, \
			name:path.basename(f,path.extname(f)).replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase()), \
			url:path.resolve(dir,f) \
		})); \
		generatePDF(imgs,path.resolve('output/temoin-catalog.pdf')) \
			.then(()=>console.log('  PDF → output/temoin-catalog.pdf')) \
			.catch(e=>{console.error(e);process.exit(1)}); \
		"

## ── Maintenance ───────────────────────────────────────────────────────

.PHONY: clean
clean: ## Remove generated output
	rm -rf output/*
	@echo "  output/ cleared"

.PHONY: tree
tree: ## Show project structure
	@echo ""
	@echo "  Temoin Catalog"
	@echo "  ─────────────"
	@find . -maxdepth 3 -not -path '*/node_modules/*' -not -path '*/.git/*' \
		| sort | sed 's|[^/]*/|  |g'
	@echo ""

## ── Help ──────────────────────────────────────────────────────────────

.PHONY: help
help: ## Show this help message
	@echo ""
	@echo "  Temoin Catalog — Available Commands"
	@echo "  ───────────────────────────────────"
	@echo "  make install        Install dependencies"
	@echo "  make dev            Start dev server (foreground)"
	@echo "  make start          Start server in background"
	@echo "  make stop           Stop background server"
	@echo "  make restart        Restart the server"
	@echo "  make port-kill      Kill any process on port $(PORT)"
	@echo ""
	@echo "  make docker-up      Start server with Docker"
	@echo "  make docker-down    Stop Docker services"
	@echo ""
	@echo "  make test           Run Playwright tests"
	@echo "  make test-ui        Run Playwright tests (headed)"
	@echo "  make test-report    Show last test report"
	@echo "  make test-api       Smoke-test live API endpoints"
	@echo "  make test-images    Generate placeholder test images"
	@echo ""
	@echo "  make format         Auto-format with Prettier"
	@echo "  make format-check   Check formatting (CI-friendly)"
	@echo "  make lint           Run ESLint"
	@echo "  make check          Run all checks (format + lint)"
	@echo "  make audit          npm security audit"
	@echo "  make audit-fix      Auto-fix audit vulnerabilities"
	@echo ""
	@echo "  make pdf            Generate PDF catalog (no server needed)"
	@echo "  make upload         Upload images to Cloudinary (make upload DIR=./my-images)"
	@echo "  make build          Build Docker image"
	@echo "  make docker-up      Start server with Docker"
	@echo "  make docker-down    Stop Docker services"
	@echo ""
	@echo "  make clean          Remove generated output"
	@echo "  make tree           Show project structure"
	@echo ""
.PHONY: deploy

	@bash -c 'set -a; source .env; set +a; vercel --prod --token $$VERCEL_TOKEN'
