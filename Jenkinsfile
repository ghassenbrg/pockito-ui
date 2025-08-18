pipeline {
  agent none

  options {
    timestamps()
    skipDefaultCheckout(true) // explicit checkout stage only
  }

  environment {
    DOCKER_REPO = 'ghassenbrg/pockito-ui'
    DOCKER_TAG  = "${env.BRANCH_NAME == 'master' ? 'latest' : env.BRANCH_NAME}"
    IMAGE       = "${DOCKER_REPO}:${DOCKER_TAG}"

    // Use explicit official namespace so Jenkins' global registry wrapper resolves correctly
    STAGE_IMAGE = 'library/node:20-bullseye'
  }

  stages {

    stage('Checkout') {
      agent any
      steps {
        checkout scm
      }
    }

    stage('Install, Lint, Test, Build (Node 20 + Chrome)') {
      agent {
        docker {
          image "${env.STAGE_IMAGE}"
          alwaysPull true
          // run as root so we can apt-get Chrome and write npm caches if needed
          args '-u 0:0'
          reuseNode true
        }
      }
      environment {
        // Wrapper we create below; ensures Chrome runs with --no-sandbox in CI
        CHROME_BIN = '/usr/local/bin/chrome-no-sandbox'
        PUPPETEER_SKIP_DOWNLOAD = 'true'
      }
      stages {
        stage('Show Versions') {
          steps {
            echo "Using stage image: ${env.STAGE_IMAGE}"
            sh 'node -v'
            sh 'npm -v'
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

              # Wrapper so Chrome always runs with safe flags in CI
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
            sh 'npm ci'
          }
        }

        stage('Lint (if present)') {
          steps {
            // Runs only if a "lint" script exists; no-op otherwise
            sh 'npm run --if-present lint'
          }
        }

        stage('Test (JUnit XML)') {
          steps {
            // Expect karma.conf.js to define ChromeHeadlessNoSandbox + JUnit reporter -> test-results/junit.xml
            sh 'npm run test:ci'
          }
          post {
            always {
              junit testResults: 'test-results/junit.xml', allowEmptyResults: true
            }
          }
        }

        // Optional: pre-compile to fail fast before Docker image build
        stage('Build (if present)') {
          steps {
            sh 'npm run --if-present build'
          }
        }
      }
    }

    stage('Docker Build') {
      // Ensure this runs on a node with Docker daemon access
      agent any
      steps {
        script {
          docker.build("${env.IMAGE}", ".")
        }
      }
    }

    stage('Docker Push') {
      when { anyOf { branch 'master'; branch 'main'; branch 'develop' } }
      agent any
      steps {
        script {
          withCredentials([string(credentialsId: 'dockerhub-token', variable: 'DOCKERHUB_TOKEN')]) {
            sh """
              echo "\$DOCKERHUB_TOKEN" | docker login -u \${DOCKER_HUB_USERNAME:-ghassenbrg} --password-stdin
              docker push "${IMAGE}"
              if [ "${BRANCH_NAME}" = "master" ]; then
                docker tag "${IMAGE}" "${DOCKER_REPO}:latest"
                docker push "${DOCKER_REPO}:latest"
              fi
            """
          }
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
    success { echo "Pipeline completed successfully for branch: ${env.BRANCH_NAME}" }
    failure { echo "Pipeline failed for branch: ${env.BRANCH_NAME}" }
  }
}
