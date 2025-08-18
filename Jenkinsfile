pipeline {
  agent none

  options {
    ansiColor('xterm')
    timestamps()
    skipDefaultCheckout(true)
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    // Registry & image
    REGISTRY        = 'docker.io'
    DOCKER_ORG      = 'ghassenbrg'
    IMAGE_NAME      = 'pockito-ui'
    DOCKERHUB_CREDS = 'dockerhub-creds'

    // Use fully-qualified public image name
    STAGE_IMAGE     = 'library/node:20-bullseye'
  }

  stages {
    stage('Checkout') {
      agent any
      steps {
        checkout scm
        script {
          // Compute tags safely
          def rawBranch = env.BRANCH_NAME?.trim()
          if (!rawBranch) { rawBranch = sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim() }
          def rawSha = env.GIT_COMMIT?.trim()
          if (!rawSha) { rawSha = sh(script: "git rev-parse HEAD", returnStdout: true).trim() }

          def shortSha   = rawSha.length() >= 7 ? rawSha.substring(0,7) : rawSha
          def branchSafe = rawBranch.replaceAll(/[^a-zA-Z0-9_.-]/, '-')

          // Persist for later stages (agent hops) to avoid "parameter not set" with `set -u`
          sh """
            cat > .image_env <<'EOF'
BRANCH_SAFE=${branchSafe}
GIT_SHA=${shortSha}
FULL_IMAGE=${env.REGISTRY}/${env.DOCKER_ORG}/${env.IMAGE_NAME}:${branchSafe}-${shortSha}
LATEST_IMAGE=${env.REGISTRY}/${env.DOCKER_ORG}/${env.IMAGE_NAME}:latest
EOF
            echo '--- .image_env ---'
            cat .image_env
          """
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
          # Install Chrome for headless tests (safe if tests skip)
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
          # Ensure build script exists using Node (no jq dependency)
          node -e "const p=require('./package.json'); if(!p.scripts||!p.scripts.build){console.error('No build script in package.json'); process.exit(1)}"
          npm ci --prefer-offline --no-audit --no-fund
          npm run build

          # Detect Angular dist output path (fallback supports Angular 17+)
          DIST_DIR=$(node -e "const fs=require('fs');const a=JSON.parse(fs.readFileSync('angular.json','utf8'));const p=a.defaultProject||Object.keys(a.projects||{})[0];if(!p){process.exit(2)}const out=a.projects?.[p]?.architect?.build?.options?.outputPath;process.stdout.write(out||('dist/'+p+'/browser'))")
          if [ -d \"$DIST_DIR/browser\" ]; then
            DIST_DIR=\"$DIST_DIR/browser\"
          fi
          echo \"DIST_DIR detected: ${DIST_DIR}\"
          echo \"DIST_DIR=${DIST_DIR}\" > .dist_env
          echo '--- .dist_env ---'
          cat .dist_env
        '''
      }
    }

    stage('Build Docker Image') {
      agent any
      steps {
        sh '''
          set -eux
          docker version
          . ./.image_env
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
    withCredentials([string(credentialsId: 'dockerhub-token', variable: 'DOCKERHUB_TOKEN')]) {
      sh '''
        set -eux
        . ./.image_env
        echo "$DOCKERHUB_TOKEN" | docker login -u ${DOCKER_HUB_USERNAME:-ghassenbrg} --password-stdin
        docker push "${FULL_IMAGE}"
        BR="${BRANCH_NAME:-$(git rev-parse --abbrev-ref HEAD)}"
        if [ "$BR" = "main" ] || [ "$BR" = "master" ]; then
          docker tag "${FULL_IMAGE}" "${LATEST_IMAGE}"
          docker push "${LATEST_IMAGE}"
        fi
      '''
    }
  }
}

  }

  post {
    success { echo "✅ Build OK." }
    failure { echo "❌ Build failed." }
  }
}
