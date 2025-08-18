pipeline {
  agent none

  options {
    ansiColor('xterm')
    timestamps()
    skipDefaultCheckout(true)
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  // ---------- Configure your registry / image here ----------
  environment {
    REGISTRY      = 'docker.io'
    DOCKER_ORG    = 'ghassenbrg'
    IMAGE_NAME    = 'pockito-ui'

    GIT_SHA       = "${env.GIT_COMMIT?.take(7) ?: ''}"
    BRANCH_SAFE   = "${env.BRANCH_NAME?.replaceAll('[^a-zA-Z0-9_.-]','-') ?: 'local'}"
    IMAGE_TAG     = "${BRANCH_SAFE}-${GIT_SHA}"
    FULL_IMAGE    = "${REGISTRY}/${DOCKER_ORG}/${IMAGE_NAME}:${IMAGE_TAG}"
    LATEST_IMAGE  = "${REGISTRY}/${DOCKER_ORG}/${IMAGE_NAME}:latest"

    // Docker Hub credentials ID in Jenkins (username+password)
    DOCKERHUB_CREDS = 'dockerhub-creds'

    // Stage image for Node/Angular work
    STAGE_IMAGE = 'node:20-bullseye'
  }

  stages {
    stage('Checkout') {
      agent any
      steps {
        checkout scm
        sh 'echo "Branch: ${BRANCH_NAME}  Commit: ${GIT_COMMIT}"'
      }
    }

    // ---- Everything Node-related runs inside a Node 20 container ----
    stage('Frontend Pipeline (Node 20 + Chrome)') {
      agent {
        docker {
          image "${env.STAGE_IMAGE}"
          alwaysPull true
          args '-u 0:0'        // root to apt-get Chrome
          reuseNode true
        }
      }
      environment {
        CHROME_BIN = '/usr/local/bin/chrome-no-sandbox'
        PUPPETEER_SKIP_DOWNLOAD = 'true'
      }
      stages {
        stage('Show Versions') {
          steps {
            sh '''
              set -e
              node -v
              npm -v
            '''
          }
        }

        stage('Install Chrome') {
          steps {
            sh '''
              set -eux
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

              google-chrome --version
            '''
          }
        }

        stage('Install Dependencies') {
          steps {
            sh 'npm ci --prefer-offline --no-audit --no-fund'
          }
        }

        stage('Lint') {
          steps {
            sh 'npm run --if-present lint'
          }
        }

        stage('Test') {
          steps {
            // Expect your package.json to have "test:ci" (e.g., Karma headless + JUnit)
            // If not present, this will no-op.
            sh 'npm run --if-present test:ci'
          }
          post {
            always {
              // Adjust if your junit.xml lands elsewhere
              junit testResults: 'test-results/junit.xml', allowEmptyResults: true
            }
          }
        }

        stage('Build') {
          steps {
            sh '''
              # Fail if no "build" script:
              jq -r '.scripts.build // empty' package.json >/dev/null 2>&1 || {
                echo "❌ No \\"build\\" script defined in package.json"; exit 1;
              }
              npm run build
            '''
          }
        }

        stage('Detect DIST_DIR') {
          steps {
            script {
              def distDir = sh(
                script: '''
                  node -e "const fs=require('fs');
                    const a=JSON.parse(fs.readFileSync('angular.json','utf8'));
                    const proj=a.defaultProject || Object.keys(a.projects||{})[0];
                    if(!proj){ console.error('No projects found in angular.json'); process.exit(2); }
                    const out=a.projects?.[proj]?.architect?.build?.options?.outputPath;
                    const fallback=`dist/${proj}/browser`;
                    console.log(out || fallback);"
                ''',
                returnStdout: true
              ).trim()
              env.DIST_DIR = distDir
              echo "✅ DIST_DIR resolved to: ${env.DIST_DIR}"
            }
          }
        }
      }
    }

    // ---- Docker build/push happens on a node with Docker daemon access ----
    stage('Docker Build') {
      agent any
      steps {
        sh '''
          set -eux
          docker version
          echo "Building image: ${FULL_IMAGE}"
          docker build \
            --build-arg BUILD_CMD="npm run build" \
            --build-arg DIST_DIR="${DIST_DIR}" \
            -t "${FULL_IMAGE}" \
            -f Dockerfile \
            .
        '''
      }
    }

    stage('Docker Push') {
      when { anyOf { branch 'master'; branch 'main' } }
      agent any
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDS}", passwordVariable: 'DOCKERHUB_PASS', usernameVariable: 'DOCKERHUB_USER')]) {
          sh '''
            set -eux
            echo "${DOCKERHUB_PASS}" | docker login -u "${DOCKERHUB_USER}" --password-stdin "${REGISTRY}"
            docker push "${FULL_IMAGE}"
            docker tag "${FULL_IMAGE}" "${LATEST_IMAGE}"
            docker push "${LATEST_IMAGE}"
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
  }
}
