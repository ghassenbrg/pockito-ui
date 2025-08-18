pipeline {
  agent none

  options {
    timestamps()
    skipDefaultCheckout(true) // explicit checkout stage
  }

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

    stage('Install, Lint, Test, Build (Node 20 + Chrome)') {
      agent {
        docker {
          // Public image; no registry credentials needed here
          image 'node:20-bullseye'
          args '-u 0:0'   // root to apt-get Chrome
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
            // running as root in container: --no-sandbox is typically required
            sh 'npm run test -- --watch=false --browsers=ChromeHeadless --no-sandbox'
          }
          post {
            always {
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
      agent any // use a node with Docker daemon access; change to label if needed
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
          // CLI login with your token (String credential)
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
        // avoid cleanWs() plugin dependency
        deleteDir()
      }
    }
  }

  post {
    success { echo "Pipeline completed successfully for branch: ${env.BRANCH_NAME}" }
    failure { echo "Pipeline failed for branch: ${env.BRANCH_NAME}" }
  }
}
