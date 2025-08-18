pipeline {
  agent any

  // Use the NodeJS tool configured in Manage Jenkins → Tools → NodeJS (name: NodeJS-18)
  tools {
    nodejs 'NodeJS-18'
  }

  environment {
    // Use repo name only here; we'll append the tag later
    DOCKER_REPO = 'ghassenbrg/pockito-ui'
    DOCKER_TAG  = "${env.BRANCH_NAME == 'master' ? 'latest' : env.BRANCH_NAME}"
    IMAGE       = "${DOCKER_REPO}:${DOCKER_TAG}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Setup Node.js') {
      steps {
        sh 'node -v'
        sh 'npm -v'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Test') {
      steps {
        // If Chrome isn't available on your agent, this will fail.
        // You can switch to a Docker agent with Chrome, or install Chrome on the node.
        sh 'npm run test -- --watch=false --browsers=ChromeHeadless'
      }
      post {
        always {
          // Adjust the pattern if your test reporter writes to a different filename/path.
          junit testResults: '**/test-results.xml', allowEmptyResults: true
        }
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Docker Build') {
      steps {
        script {
          docker.build("${env.IMAGE}")
        }
      }
    }

    stage('Docker Push') {
      when {
        anyOf { branch 'master'; branch 'main'; branch 'develop' }
      }
      steps {
        script {
          withCredentials([string(credentialsId: 'dockerhub-token', variable: 'DOCKERHUB_TOKEN')]) {
            sh '''
              echo "$DOCKERHUB_TOKEN" | docker login -u ${DOCKER_HUB_USERNAME:-ghassenbrg} --password-stdin
              docker push '"${IMAGE}"'
              if [ "${BRANCH_NAME}" = "master" ]; then
                docker tag '"${IMAGE}"' '"${DOCKER_REPO}:latest"'
                docker push '"${DOCKER_REPO}:latest"'
              fi
            '''
          }
        }
      }
    }
  }

  post {
    always {
      // Don't fail the build if pruning or Docker access is restricted
      sh 'docker system prune -f || true'
      cleanWs()
    }
    success {
      echo "Pipeline completed successfully for branch: ${env.BRANCH_NAME}"
    }
    failure {
      echo "Pipeline failed for branch: ${env.BRANCH_NAME}"
    }
  }
}
