# Configure AWS for RebootRoute

Use this in order. The local assessment works without an account. Deploying the template creates real AWS resources, so first confirm the account, region, and a budget alert. Never send keys, passwords, or login codes through chat.

## 1. Create or choose your account

Open [AWS account signup](https://aws.amazon.com/free/) or use your hackathon/team account. Eligible new customers receive $100 initially and may earn another $100 through qualifying activities; “up to $200” is not $200 automatically. The Free plan ends after six months or when credits are exhausted. The Paid plan can charge beyond credits. Existing accounts may have different eligibility. Confirm the plan and service availability in your own console before proceeding. See [AWS Free Tier FAQ](https://aws.amazon.com/free/free-tier-faqs/).

Enable MFA for the root user in the account security settings. Use root for initial account setup, then use a separate deployment identity for daily development. Select **Asia Pacific (Mumbai), `ap-south-1`** for this project. Do not create EC2, EKS, RDS, NAT gateways, or SageMaker endpoints: none is needed by the PRD's serverless architecture.

## 2. Set a budget before any deployment

In **Billing and Cost Management → Budgets → Create budget**, create a monthly cost budget named `rebootroute-hackathon`, for example **USD 10**. Add email alerts at 50%, 80%, and 100% actual cost, and 100% forecast cost. Configure the budget to include usage costs before credits/refunds so credits do not hide usage. Enable Free Tier usage notifications where your account offers them and review your credit balance.

Budget alerts are notifications, not spending caps, and billing data is delayed. See [Creating a cost budget](https://docs.aws.amazon.com/cost-management/latest/userguide/create-cost-budget.html) and [Budget best practices](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-best-practices.html).

## 3. Install AWS CLI and AWS SAM CLI on this Mac

Using Homebrew, run:

```sh
brew install awscli aws-sam-cli
aws --version
sam --version
```

Use AWS CLI v2.32.0 or later for browser login. AWS also provides official installers: [AWS CLI installation](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), [SAM installation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html). Docker is needed for `sam local start-api`, but not for this app's normal local UI, lint validation, or native SAM build.

## 4. Sign in with temporary credentials

### Personal AWS account with an IAM console user

Create a separate deployment user or role with console access and MFA. The identity needs `SignInLocalDevelopmentAccess` to use browser login, plus deployment permissions. Then run:

```sh
aws login --profile rebootroute
aws configure set region ap-south-1 --profile rebootroute
aws sts get-caller-identity --profile rebootroute --region ap-south-1
```

Log in as the deployment identity when the browser opens. Check the returned account ID and identity. See [AWS browser login](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sign-in.html).

### Team account already using IAM Identity Center

Use the AWS access-portal URL and SSO region supplied by your account administrator. Do not enable AWS Organizations solely for this project: it is unnecessary and can affect Free Tier eligibility. Run:

```sh
aws configure sso --profile rebootroute
aws sso login --profile rebootroute
aws sts get-caller-identity --profile rebootroute --region ap-south-1
```

Select the intended account and deployment permission set, use `ap-south-1` as the default client region, and `json` as output. The SSO directory region may differ from the project region. See [CLI SSO setup](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html).

### Deployment permissions

SAM uses CloudFormation to create/update API Gateway, Lambda, IAM execution roles, DynamoDB, S3, Cognito, EventBridge, SNS, and CloudWatch resources. A read-only identity cannot deploy this stack. `PowerUserAccess` alone does not grant the required IAM role creation/pass-role actions. For a team account, ask the administrator for a scoped CloudFormation deployment role and permission to pass it. For a personal hackathon account, use a separate deployment identity with the needed permissions and reduce them once the stack exists. Do not attach broad policies to the runtime Lambda; its generated role currently needs only log access.

If a SAM version cannot read the newer login-session credentials, use the documented process-profile bridge rather than generating permanent access keys:

```sh
aws configure set credential_process 'aws configure export-credentials --profile rebootroute --format process' --profile rebootroute-sam
aws configure set region ap-south-1 --profile rebootroute-sam
```

Use `--profile rebootroute-sam` for SAM commands in that case. Leave `rebootroute` as the underlying browser-login profile to avoid recursion.

## 5. Validate and build before deployment

From the repository root:

```sh
npm ci
npm run check
npm run aws:check
sam validate --lint --region ap-south-1
PATH="$PWD/node_modules/.bin:$PATH" sam build
```

`aws:check` is read-only: it reports tools and the active `rebootroute` identity. It does not verify that you created a budget. Verify that separately in Billing. SAM builds the shared TypeScript rules into the Lambda with esbuild.

## 6. Deploy the preview backend when ready

After confirming your identity and budget:

```sh
sam deploy --guided --profile rebootroute --region ap-south-1
```

Choose:

| Prompt | Value |
|---|---|
| Stack name | `rebootroute-development` |
| Region | `ap-south-1` |
| AppEnvironment | `development` |
| AllowedOrigin | `http://127.0.0.1:5173` for local testing |
| Confirm changes before deploy | Yes |
| Allow SAM to create IAM roles | Yes, after reviewing the change set |
| Disable rollback | No |
| Public assessment function warning | Public health/preview are intentional; `/session` has a Cognito authorizer |
| Save deployment arguments | Yes; `samconfig.toml` is gitignored |

For a team deployment role, include the administrator-provided `--role-arn`. Review the change set before confirming. This phase's stack creates empty tables/private storage and a working assessment API, not the complete Day 2 custody application.

The stack outputs provide `ApiBaseUrl`, Cognito identifiers, table names, bucket name, bus, and notification topic ARN. Do not invent or manually hardcode resource names. Copy `.env.example` to `.env`, set `VITE_API_BASE_URL` to the exact `ApiBaseUrl`, and restart `npm run dev`. Empty `VITE_API_BASE_URL` keeps the app entirely local.

Check `GET <ApiBaseUrl>/health`, then assess a working phone and a swollen power bank through the website. The preview endpoint does not save device details. Never put AWS access keys in a `VITE_` variable; frontend values are visible to anyone loading the site.

## 7. Publish with Amplify Hosting

Do this when you're ready to publish a reviewed milestone. In **Amplify → Create new app**, connect the GitHub repository and select the branch containing the implementation. The committed `amplify.yml` runs `npm ci` and `npm run build`, publishing `dist`. This work has not been pushed, so the remote planning-only branch cannot yet build it.

Use the Amplify HTTPS URL as the SAM `AllowedOrigin` parameter (origin only, no path or trailing slash), then update the backend stack. Set `VITE_API_BASE_URL`, `VITE_AWS_REGION`, and later the public Cognito identifiers in Amplify environment variables, then redeploy the frontend. The app currently uses no client-side path router, so no SPA rewrites are needed yet. See [Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/getting-started.html).

## 8. Notifications and monitoring

Subscribe a coordinator email to the stack's SNS topic and confirm the email. CloudWatch Lambda errors are wired to that topic. EventBridge routes `SafetyReviewRequested` events to a fixed, privacy-safe SNS message; publication from the custody workflow is Day 2 work. No user body data belongs in logs or notifications.

The template keeps Lambda logs for 14 days, limits REST API requests to a 5/sec rate and burst of 10, encrypts DynamoDB/S3 storage, blocks public S3 access, requires TLS for the bucket, and expires photo objects at 90 days. API throttling is best effort, not an exact spending limit. CloudWatch's Lambda error alarm does not detect validation 4xx responses or all application failures; expand metrics with the persistent workflow.

## 9. Cleanup after the demo

`sam delete --stack-name rebootroute-development --profile rebootroute --region ap-south-1` removes the stack resources subject to their deletion policies. **DynamoDB tables and the image bucket are retained deliberately** to avoid accidental loss of records. Deleting the stack does not delete their data or stop their storage costs. After exporting anything you need, review and delete those retained resources separately in the console. Also remove Amplify hosting and any SNS subscriptions you no longer need. Do not perform cleanup while a campus drive is using the system.

## What to tell Codex after setup

Share only: account setup is complete, your chosen profile name if different, region, and whether the budget alert is enabled. Do not share credentials. The next implementation phase adds validated private uploads, short-lived guest sessions, DynamoDB records, privacy-safe QR receipts, and audited custody actions before claiming a complete cloud workflow.
