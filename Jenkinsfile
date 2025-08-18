pipeline {
  agent none  // choose agents per stage

  environment {
    DOCKER_REPO = 'ghassenbrg/pockito-ui'
    DOCKER_TAG  = "${env.BRANCH_NAME == 'master' ? 'latest' : env.BRANCH_NAME}"
    IMAGE       = "${DOCKER_REPO}:${DOCKER_TAG}"
  }

  stages {

    stage('Checkout') {
      agent any
      steps {
        checkout scm
      }
    }

    stage('Install, Lint, Test, Build (Node 18.20.5 + Chrome)') {
      agent {
        // Exact Node version required
        docker {
          image 'node:18.20.5'
          // run as root so we can apt-get install Chrome
          args '-u 0:0'
          reuseNode true
        }
      }
      environment {
        CHROME_BIN = '/usr/bin/google-chrome'
        PUPPETEER_SKIP_DOWNLOAD = 'true'
      }
      stages {
        stage('Show Versions') {
          steps {
            sh 'node -v'
            sh 'npm -v'
          }
        }

        stage('Install Chrome') {
          steps {
            // Install Google Chrome inside the container
            sh '''
              set -eux
              apt-get update
              apt-get install -y wget gnupg ca-certificates

              # Google signing key + repo
              install -m 0755 -d /etc/apt/keyrings
              wget -qO- https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/keyrings/google.gpg
              chmod a+r /etc/apt/keyrings/google.gpg
              echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

              apt-get update
              apt-get install -y google-chrome-stable

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
            // Running as root; use --no-sandbox to avoid Chrome sandbox issues
            sh 'npm run test -- --watch=false --browsers=ChromeHeadless --no-sandbox'
          }
          post {
            always {
              // Adjust glob to your reporter output
              junit testResults: '**/test-results.xml', allowEmptyResults: true
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
      // choose a node that has Docker CLI + daemon access
      agent any
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
        cleanWs()
      }
    }
  }

  post {
    success { echo "Pipeline completed successfully for branch: ${env.BRANCH_NAME}" }
    failure { echo "Pipeline failed for branch: ${env.BRANCH_NAME}" }
  }
}
