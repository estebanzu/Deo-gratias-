.PHONY: dev deploy clean check security format

dev:
	@echo "Starting local dev server..."
	npm run dev

deploy:
	@echo "Deploying to Vercel..."
	@if [ -f .env ]; then \
		TOKEN=$$(grep '^VERCEL_TOKEN=' .env | tail -1 | cut -d= -f2- | tr -d '[:space:]'); \
		while IFS= read -r line || [ -n "$$line" ]; do \
			case "$$line" in \#*|"") continue ;; esac; \
			key=$$(echo "$$line" | cut -d= -f1); \
			value=$$(echo "$$line" | cut -d= -f2-); \
			echo "Setting $$key"; \
			echo "$$value" | HOME=$(PWD)/tmp_home vercel env add $$key production --yes --force --token "$$TOKEN" 2>&1 || true; \
		done < .env; \
	fi
	HOME=$(PWD)/tmp_home vercel --prod --token "$$(grep '^VERCEL_TOKEN=' .env | tail -1 | cut -d= -f2- | tr -d '[:space:]')"

clean:
	@echo "Cleaning build artifacts..."
	rm -rf node_modules
	rm -rf tmp_home
	rm -rf output
	rm -rf uploads
	rm -rf test-results
	rm -rf .vercel
	@echo "Done."

check:
	@echo "Running linter..."
	npm run lint
	@echo "All checks passed."

security:
	@echo "Scanning for secrets..."
	npx --yes gitleaks detect --source=. || true
	@echo "Auditing dependencies..."
	npm audit --omit=dev || true
	@echo "Security scan complete."

format:
	@echo "Formatting code..."
	npm run format
	@echo "Done."
