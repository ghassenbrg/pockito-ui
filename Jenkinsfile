pipeline {
  agent none

  options {
    ansiColor('xterm')
    timestamps()
    skipDefaultCheckout(true)
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    // Registry settings
    REGISTRY        = 'docker.io'
    DOCKER_ORG      = 'ghassenbrg'
    IMAGE_NAME      = 'pockito-ui'
    DOCKERHUB_CREDS = 'dockerhub-creds'
    // Node build image
    STAGE_IMAGE     = 'node:20-bullseye'
    // Will be set in Checkout stage
    GIT_SHA         = ''
    BRANCH_SAFE     = ''
    IMAGE_TAG       = ''
    FULL_IMAGE      = ''
    LATEST_IMAGE    = ''
    DIST_DIR        = ''
  }

  stages {
    stage('Checkout') {
      agent any
      steps {
        checkout scm
        script {
          // Compute tags safely (no Groovy calls in environment block)
          def rawBranch = env.BRANCH_NAME?.trim()
          if (!rawBranch) { rawBranch = sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim() }
          def rawSha = env.GIT_COMMIT?.trim()
          if (!rawSha) { rawSha = sh(script: "git rev-parse HEAD", returnStdout: true).trim() }

          def shortSha   = rawSha.length() >= 7 ? rawSha.substring(0,7) : rawSha
          def branchSafe = rawBranch.replaceAll(/[^a-zA-Z0-9_.-]/, '-')

          env.GIT_SHA      = shortSha
          env.BRANCH_SAFE  = branchSafe
          env.IMAGE_TAG    = "${branchSafe}-${shortSha}"
          env.FULL_IMAGE   = "${env.REGISTRY}/${env.DOCKER_ORG}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
          env.LATEST_IMAGE = "${env.REGISTRY}/${env.DOCKER_ORG}/${env.IMAGE_NAME}:latest"

          echo "Branch: ${rawBranch}  Commit: ${rawSha}"
          echo "Image tag: ${env.IMAGE_TAG}"
        }
      }
    }

    stage('Lint') {
      agent {
        docker {
          image "${env.STAGE_IMAGE}"
          alwaysPull true
          args '-u 0:0'
          reuseNode true
        }
      }
      steps {
        sh '''
          node -v
          npm -v
          npm ci --prefer-offline --no-audit --no-fund
          npm run --if-present lint
        '''
      }
    }

    stage('Test') {
      agent {
        docker {
          image "${env.STAGE_IMAGE}"
          alwaysPull true
          args '-u 0:0'
          reuseNode true
        }
      }
      environment {
        CHROME_BIN = '/usr/local/bin/chrome-no-sandbox'
        PUPPETEER_SKIP_DOWNLOAD = 'true'
      }
      steps {
        sh '''
          set -eux
          # Install Chrome for headless tests (safe if tests don't need it)
          apt-get update
          apt-get install -y wget gnupg ca-certificates
          install -m 0755 -d /etc/apt/keyrings
          wget -qO- https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/keyrings/google.gpg
          chmod a+r /etc/apt/keyrings/google.gpg
          echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
          apt-get update
          apt-get install -y google-chrome-stable
          cat >/usr/local/bin/chrome-no-sandbox <<'EOF'
#!/usr/bin/env bash
exec /usr/bin/google-chrome --no-sandbox --disable-dev-shm-usage "$@"
EOF
          chmod +x /usr/local/bin/chrome-no-sandbox
          
          npm ci --prefer-offline --no-audit --no-fund
          npm run --if-present test:ci
        '''
      }
      post {
        always {
          junit testResults: 'test-results/junit.xml', allowEmptyResults: true
        }
      }
    }

    stage('Build') {
      agent {
        docker {
          image "${env.STAGE_IMAGE}"
          alwaysPull true
          args '-u 0:0'
          reuseNode true
        }
      }
      steps {
        sh '''
          # Ensure build script exists then build
          jq -r '.scripts.build // empty' package.json >/dev/null 2>&1 || {
            echo "❌ No \\"build\\" script in package.json"; exit 1;
          }
          npm ci --prefer-offline --no-audit --no-fund
          npm run build

          # Detect Angular dist output path (fallback to Angular 17+ default)
          DIST_DIR=$(node -e "const fs=require('fs');const a=JSON.parse(fs.readFileSync('angular.json','utf8'));const p=a.defaultProject||Object.keys(a.projects||{})[0];if(!p){process.exit(2)}const out=a.projects?.[p]?.architect?.build?.options?.outputPath;process.stdout.write(out||('dist/'+p+'/browser'))")
          echo "DIST_DIR detected: ${DIST_DIR}"
          echo "DIST_DIR=${DIST_DIR}" > .dist_env
        '''
      }
    }

    stage('Build Docker Image') {
      agent any
      steps {
        sh '''
          set -eux
          docker version
          . ./.dist_env
          echo "Building image: ${FULL_IMAGE}  with DIST_DIR=${DIST_DIR}"
          docker build \
            --build-arg BUILD_CMD="npm run build" \
            --build-arg DIST_DIR="${DIST_DIR}" \
            -t "${FULL_IMAGE}" \
            -f Dockerfile \
            .
        '''
      }
    }

    stage('Push Image') {
      agent any
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDS}", passwordVariable: 'DOCKERHUB_PASS', usernameVariable: 'DOCKERHUB_USER')]) {
          sh '''
            set -eux
            echo "${DOCKERHUB_PASS}" | docker login -u "${DOCKERHUB_USER}" --password-stdin "${REGISTRY}"
            docker push "${FULL_IMAGE}"

            # Also tag as :latest on main/master
            BR="${BRANCH_NAME:-$(git rev-parse --abbrev-ref HEAD)}"
            if [ "$BR" = "main" ] || [ "$BR" = "master" ]; then
              docker tag "${FULL_IMAGE}" "${LATEST_IMAGE}"
              docker push "${LATEST_IMAGE}"
            fi
          '''
        }
      }
    }

    stage('Cleanup') {
      agent any
      steps {
        sh 'docker system prune -f || true'
        deleteDir()
      }
    }
  }

  post {
    success { echo "✅ Build OK. Image: ${FULL_IMAGE}" }
    failure { echo "❌ Build failed." }
    always  { sh 'docker images | head -n 20 || true' }
  }
}
