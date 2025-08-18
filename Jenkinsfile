pipeline {
  agent none

  options {
    timestamps()
    skipDefaultCheckout(true)
  }

  environment {
    DOCKER_REPO = 'ghassenbrg/pockito-ui'
    DOCKER_TAG  = "${env.BRANCH_NAME == 'master' ? 'latest' : env.BRANCH_NAME}"
    IMAGE       = "${DOCKER_REPO}:${DOCKER_TAG}"
    STAGE_IMAGE = 'library/node:20-bullseye' // keep library/ so Jenkins' registry wrapper resolves correctly
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
          args '-u 0:0'     // root so we can apt-get Chrome
          reuseNode true
        }
      }
      environment {
        // We'll point this to a wrapper we create after installing Chrome
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

              # Create a wrapper so Chrome always runs with no-sandbox + dev-shm workaround
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
          steps { sh 'npm ci' }
        }

        stage('Lint (if present)') {
          steps {
            sh '''
              if npm run -s | grep -q "^  lint "; then
                npm run lint
              else
                echo "ℹ️  No \\"lint\\" script found in package.json; skipping."
              fi
            '''
          }
        }

        stage('Test') {
          steps {
            // Do NOT pass --no-sandbox here; the wrapper handles it.
            sh 'npm run test -- --watch=false --browsers=ChromeHeadless'
          }
          post {
            always {
              // Publish JUnit only if XML exists
              script {
                def hasReports = sh(script: "ls -1 **/*.xml 2>/dev/null | wc -l", returnStdout: true).trim()
                if (hasReports != '0') {
                  junit testResults: '**/*.xml', allowEmptyResults: true
                } else {
                  echo 'No JUnit XML reports found; skipping publish.'
                }
              }
            }
          }
        }

        stage('Build (if present)') {
          steps {
            sh '''
              if npm run -s | grep -q "^  build "; then
                npm run build
              else
                echo "ℹ️  No \\"build\\" script found in package.json; skipping."
              fi
            '''
          }
        }
      }
    }

    stage('Docker Build') {
      agent any   // run on a node with Docker daemon access
      steps {
        script {
          docker.build("${env.IMAGE}")
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
