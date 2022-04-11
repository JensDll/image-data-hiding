import * as cdk from 'aws-cdk-lib'
import {
  aws_ec2,
  aws_elasticloadbalancingv2,
  aws_ecs,
  aws_route53,
  aws_route53_targets
} from 'aws-cdk-lib'
import { Construct } from 'constructs'

interface LoadBalancerProps
  extends aws_elasticloadbalancingv2.ApplicationLoadBalancerProps {
  listenerCertificateArn?: string
  aRecordDomainName?: string
}

export interface LoadBalancedServiceProps
  extends Omit<
    aws_ecs.CfnServiceProps,
    'desiredCount' | 'launchType' | 'networkConfiguration' | 'loadBalancers'
  > {
  loadBalancer: LoadBalancerProps
}

export class LoadBalancedService extends aws_ecs.CfnService {
  securityGroup: aws_ec2.SecurityGroup
  loadBalancer: aws_elasticloadbalancingv2.ApplicationLoadBalancer
  loadBalancerARecord?: aws_route53.ARecord

  constructor(scope: Construct, id: string, props: LoadBalancedServiceProps) {
    const { targetSecurityGroup, loadBalancerSecurityGroup } =
      createSecurityGroupPair(scope, id, props.loadBalancer.vpc)

    const loadBalancer = new aws_elasticloadbalancingv2.ApplicationLoadBalancer(
      scope,
      id + 'LoadBalancer',
      {
        ...props.loadBalancer,
        internetFacing: true,
        vpcSubnets: { subnetType: aws_ec2.SubnetType.PUBLIC },
        deletionProtection: false,
        securityGroup: loadBalancerSecurityGroup
      }
    )

    const targetGroup = new aws_elasticloadbalancingv2.ApplicationTargetGroup(
      scope,
      id + 'TargetGroup',
      {
        vpc: props.loadBalancer.vpc,
        targetType: aws_elasticloadbalancingv2.TargetType.IP,
        protocol: aws_elasticloadbalancingv2.ApplicationProtocol.HTTPS
      }
    )

    if (props.loadBalancer.listenerCertificateArn) {
      loadBalancer.addListener('http', {
        port: 80,
        defaultAction: aws_elasticloadbalancingv2.ListenerAction.redirect({
          protocol: aws_elasticloadbalancingv2.ApplicationProtocol.HTTPS,
          permanent: true,
          port: '443'
        })
      })

      loadBalancer.addListener('https', {
        port: 443,
        defaultAction: aws_elasticloadbalancingv2.ListenerAction.forward([
          targetGroup
        ]),
        certificates: [
          aws_elasticloadbalancingv2.ListenerCertificate.fromArn(
            props.loadBalancer.listenerCertificateArn
          )
        ]
      })
    } else {
      loadBalancer.addListener('http', {
        port: 80,
        defaultAction: aws_elasticloadbalancingv2.ListenerAction.forward([
          targetGroup
        ])
      })
    }

    let aRecord: aws_route53.ARecord | undefined

    if (props.loadBalancer.aRecordDomainName) {
      aRecord = new aws_route53.ARecord(scope, 'loadBalancerARecord', {
        zone: aws_route53.HostedZone.fromLookup(scope, 'hostedZoneLookup', {
          domainName: props.loadBalancer.aRecordDomainName
        }),
        target: aws_route53.RecordTarget.fromAlias(
          new aws_route53_targets.LoadBalancerTarget(loadBalancer)
        )
      })
    }

    super(scope, id, {
      ...props,
      desiredCount: 1,
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          securityGroups: [targetSecurityGroup.securityGroupId],
          subnets: props.loadBalancer.vpc.isolatedSubnets.map(
            subnet => subnet.subnetId
          ),
          assignPublicIp: 'DISABLED'
        }
      },
      loadBalancers: [
        {
          containerName: props.serviceName,
          containerPort: 443,
          targetGroupArn: targetGroup.targetGroupArn
        }
      ]
    })

    this.addDependsOn(targetGroup.node.defaultChild as cdk.CfnResource)
    this.addDependsOn(targetSecurityGroup.node.defaultChild as cdk.CfnResource)
    loadBalancer.listeners.forEach(listener =>
      this.addDependsOn(listener.node.defaultChild as cdk.CfnResource)
    )

    this.securityGroup = targetSecurityGroup
    this.loadBalancer = loadBalancer
    this.loadBalancerARecord = aRecord
  }
}

function createSecurityGroupPair(
  scope: Construct,
  id: string,
  vpc: aws_ec2.IVpc
) {
  const targetSecurityGroup = new aws_ec2.SecurityGroup(
    scope,
    id + 'TargetSecurityGroup',
    {
      vpc
    }
  )

  const loadBalancerSecurityGroup = new aws_ec2.SecurityGroup(
    scope,
    id + 'LoadBalancerSecurityGroup',
    {
      vpc,
      allowAllOutbound: false,
      // Avoid circular dependency by using the AWS::EC2::SecurityGroupEgress
      // and AWS::EC2::SecurityGroupIngress resources.
      // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ec2-security-group
      disableInlineRules: true
    }
  )

  targetSecurityGroup.addIngressRule(
    aws_ec2.Peer.securityGroupId(loadBalancerSecurityGroup.securityGroupId),
    aws_ec2.Port.tcp(80),
    'Allow HTTP from the load balancer'
  )

  targetSecurityGroup.addIngressRule(
    aws_ec2.Peer.securityGroupId(loadBalancerSecurityGroup.securityGroupId),
    aws_ec2.Port.tcp(443),
    'Allow HTTPS from the load balancer'
  )

  loadBalancerSecurityGroup.addIngressRule(
    aws_ec2.Peer.anyIpv4(),
    aws_ec2.Port.tcp(80),
    'Allow HTTP from anywhere'
  )

  loadBalancerSecurityGroup.addIngressRule(
    aws_ec2.Peer.anyIpv4(),
    aws_ec2.Port.tcp(443),
    'Allow HTTPS from anywhere'
  )

  loadBalancerSecurityGroup.addEgressRule(
    aws_ec2.Peer.securityGroupId(targetSecurityGroup.securityGroupId),
    aws_ec2.Port.tcp(80),
    'Allow HTTP to the target'
  )

  loadBalancerSecurityGroup.addEgressRule(
    aws_ec2.Peer.securityGroupId(targetSecurityGroup.securityGroupId),
    aws_ec2.Port.tcp(443),
    'Allow HTTPS to the target'
  )

  return {
    targetSecurityGroup,
    loadBalancerSecurityGroup
  }
}
