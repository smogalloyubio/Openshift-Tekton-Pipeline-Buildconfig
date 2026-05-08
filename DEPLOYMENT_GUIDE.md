# OpenShift SRE Simulator - Deployment Guide

This guide provides step-by-step instructions for building and deploying the OpenShift SRE Simulator on your OpenShift cluster using CI/CD pipelines.

## Overview

The OpenShift SRE Simulator is an interactive web-based game that teaches Site Reliability Engineering (SRE) concepts. It simulates managing a Kubernetes cluster with pod failures, resource constraints, and incident management.

**Key Features:**
- Real-time pod monitoring and management
- Simulated cluster chaos and failures
- Interactive pod restart functionality
- Cluster scaling capabilities
- Score-based gamification
- Responsive web interface

## Prerequisites

Before deploying, ensure you have:

1. **OpenShift Cluster Access**: A running OpenShift 4.x cluster with `oc` CLI installed
2. **Container Registry**: Access to an internal or external container registry (e.g., Quay.io, Docker Hub)
3. **Tekton Pipelines**: Installed on your cluster (or use Jenkins/GitLab CI as alternatives)
4. **Git Repository**: Your code pushed to a Git repository (GitHub, GitLab, Gitea, etc.)
5. **Permissions**: Cluster admin or namespace admin access

## Architecture

The deployment consists of:

- **Frontend**: React 19 application with Tailwind CSS
- **Backend**: Express.js server for static file serving
- **Container**: Docker/Podman containerized application
- **Orchestration**: OpenShift Deployment with 3 replicas
- **Networking**: OpenShift Route for external access
- **CI/CD**: Tekton Pipeline for automated build and deployment
- **Scaling**: Horizontal Pod Autoscaler (HPA) for dynamic scaling

## Deployment Methods

### Method 1: Manual Deployment (Quick Start)

#### Step 1: Build the Container Image

```bash
# Clone the repository
git clone https://github.com/your-org/openshift-sre-simulator.git
cd openshift-sre-simulator

# Build the image locally (if using Podman/Docker)
podman build -t sre-simulator:latest -f Dockerfile .

# Or build directly on OpenShift using S2I
oc new-build --name=sre-simulator \
  --binary \
  --strategy=docker \
  -n sre-simulator

# Upload the Dockerfile and source
oc start-build sre-simulator --from-dir=. -n sre-simulator
```

#### Step 2: Push to Registry

```bash
# Tag the image
podman tag sre-simulator:latest quay.io/your-org/sre-simulator:latest

# Push to registry
podman push quay.io/your-org/sre-simulator:latest

# Or use OpenShift's internal registry
podman tag sre-simulator:latest image-registry.openshift-image-registry.svc:5000/sre-simulator/sre-simulator:latest
podman push image-registry.openshift-image-registry.svc:5000/sre-simulator/sre-simulator:latest
```

#### Step 3: Deploy to OpenShift

```bash
# Create namespace
oc create namespace sre-simulator

# Apply deployment manifests
oc apply -f openshift-deployment.yaml -n sre-simulator

# Verify deployment
oc get pods -n sre-simulator
oc get svc -n sre-simulator
oc get route -n sre-simulator

# Check the route URL
oc get route sre-simulator -n sre-simulator -o jsonpath='{.spec.host}'
```

#### Step 4: Access the Application

```bash
# Get the route URL
ROUTE=$(oc get route sre-simulator -n sre-simulator -o jsonpath='{.spec.host}')
echo "Access the application at: https://$ROUTE"

# Or open in browser
open "https://$ROUTE"
```

### Method 2: Automated Deployment with Tekton Pipeline

#### Step 1: Install Tekton (if not already installed)

```bash
# Install Tekton Pipelines
oc apply -f https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml

# Install Tekton Triggers
oc apply -f https://storage.googleapis.com/tekton-releases/triggers/latest/release.yaml

# Verify installation
oc get pods -n tekton-pipelines
```

#### Step 2: Create GitHub Webhook Secret (Optional)

```bash
# Create secret for GitHub webhook validation
oc create secret generic github-webhook-secret \
  --from-literal=github-secret=your-webhook-secret \
  -n sre-simulator
```

#### Step 3: Deploy Tekton Pipeline

```bash
# Apply Tekton pipeline manifests
oc apply -f tekton-pipeline.yaml -n sre-simulator

# Verify pipeline creation
oc get pipeline -n sre-simulator
oc get eventlistener -n sre-simulator
```

#### Step 4: Trigger the Pipeline

**Option A: Manual Trigger**

```bash
# Create a PipelineRun to start the build
oc create -f - <<EOF
apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  generateName: sre-simulator-run-
  namespace: sre-simulator
spec:
  pipelineRef:
    name: sre-simulator-pipeline
  workspaces:
  - name: shared-workspace
    volumeClaimTemplate:
      spec:
        accessModes:
        - ReadWriteOnce
        resources:
          requests:
            storage: 1Gi
  params:
  - name: git-url
    value: https://github.com/your-org/openshift-sre-simulator.git
  - name: git-revision
    value: main
EOF

# Monitor the pipeline run
oc get pipelineruns -n sre-simulator
oc logs -f pipelinerun/sre-simulator-run-xxxxx -n sre-simulator
```

**Option B: GitHub Webhook Integration**

```bash
# Get the EventListener route
LISTENER_URL=$(oc get route el-sre-simulator-listener -n sre-simulator -o jsonpath='{.spec.host}')

# Add webhook to GitHub repository:
# 1. Go to Settings → Webhooks → Add webhook
# 2. Payload URL: https://$LISTENER_URL
# 3. Content type: application/json
# 4. Secret: (use the same secret from the webhook secret)
# 5. Events: Push events
# 6. Active: Yes
```

#### Step 5: Monitor Deployment

```bash
# Watch the deployment rollout
oc rollout status deployment/sre-simulator -n sre-simulator

# Check pod status
oc get pods -n sre-simulator -w

# View logs
oc logs -f deployment/sre-simulator -n sre-simulator

# Check application health
oc describe pod <pod-name> -n sre-simulator
```

## Configuration

### Environment Variables

Edit `openshift-deployment.yaml` to configure:

```yaml
env:
- name: NODE_ENV
  value: "production"
- name: PORT
  value: "3000"
```

### Resource Limits

Adjust resource requests and limits in the Deployment spec:

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### Scaling

The Horizontal Pod Autoscaler automatically scales based on CPU/memory usage:

```yaml
minReplicas: 3
maxReplicas: 10
metrics:
- type: Resource
  resource:
    name: cpu
    target:
      type: Utilization
      averageUtilization: 70
```

## Troubleshooting

### Pod Not Starting

```bash
# Check pod events
oc describe pod <pod-name> -n sre-simulator

# Check logs
oc logs <pod-name> -n sre-simulator

# Common issues:
# - Image not found: Verify image registry and credentials
# - Resource constraints: Check node capacity
# - Security context: Verify SCC (Security Context Constraint)
```

### Application Not Accessible

```bash
# Verify service
oc get svc sre-simulator -n sre-simulator

# Verify route
oc get route sre-simulator -n sre-simulator

# Test connectivity
oc port-forward svc/sre-simulator 3000:80 -n sre-simulator
curl http://localhost:3000
```

### Build Failures

```bash
# Check build logs
oc logs -f bc/sre-simulator -n sre-simulator

# Common issues:
# - Dependency installation failures: Check Dockerfile
# - Build timeout: Increase timeout in BuildConfig
# - Registry authentication: Verify image pull secrets
```

## Monitoring and Observability

### Prometheus Metrics

The application exposes metrics at `/metrics` (if configured). Add to Prometheus:

```yaml
scrape_configs:
- job_name: 'sre-simulator'
  static_configs:
  - targets: ['sre-simulator.sre-simulator.svc:3000']
```

### Logs

View application logs:

```bash
# Real-time logs
oc logs -f deployment/sre-simulator -n sre-simulator

# Logs from specific pod
oc logs <pod-name> -n sre-simulator

# Previous logs (if pod crashed)
oc logs <pod-name> --previous -n sre-simulator
```

### Health Checks

The deployment includes liveness and readiness probes:

```bash
# Check probe status
oc get pod <pod-name> -n sre-simulator -o jsonpath='{.status.conditions[*]}'
```

## Updating the Application

### Rolling Update

```bash
# Update the image in the deployment
oc set image deployment/sre-simulator \
  sre-simulator=quay.io/your-org/sre-simulator:v2.0 \
  -n sre-simulator

# Monitor rollout
oc rollout status deployment/sre-simulator -n sre-simulator
```

### Rollback

```bash
# Rollback to previous version
oc rollout undo deployment/sre-simulator -n sre-simulator

# Check rollout history
oc rollout history deployment/sre-simulator -n sre-simulator
```

## Security Considerations

1. **Security Context**: The deployment runs as non-root user (UID 1001)
2. **Network Policies**: Consider adding NetworkPolicy for pod-to-pod communication
3. **RBAC**: Service account has minimal permissions
4. **Image Registry**: Use private registry with authentication
5. **TLS**: Route uses TLS termination (edge)
6. **Pod Security Standards**: Ensure cluster has pod security policies enabled

## Performance Optimization

1. **Resource Requests**: Set appropriate CPU/memory requests for scheduling
2. **Horizontal Scaling**: HPA automatically scales based on load
3. **Pod Disruption Budget**: Ensures availability during cluster maintenance
4. **Anti-Affinity**: Spreads pods across nodes for high availability

## Cleanup

To remove the application:

```bash
# Delete all resources
oc delete namespace sre-simulator

# Or delete specific resources
oc delete deployment sre-simulator -n sre-simulator
oc delete svc sre-simulator -n sre-simulator
oc delete route sre-simulator -n sre-simulator
```

## Support and Documentation

- **OpenShift Documentation**: https://docs.openshift.com/
- **Tekton Documentation**: https://tekton.dev/docs/
- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **Container Best Practices**: https://docs.openshift.com/container-platform/latest/openshift_images/

## Next Steps

1. Customize the application for your use case
2. Integrate with your monitoring and logging solutions
3. Set up automated backups and disaster recovery
4. Implement additional security policies
5. Scale the deployment across multiple clusters
