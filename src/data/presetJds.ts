export interface PresetJd {
  id: string;
  title: string;
  company: string;
  targetRole: string;
  text: string;
  tailoredSummary: string;
}

export const PRESET_JDS: PresetJd[] = [
  {
    id: 'jd-ai-arch',
    title: 'Principal AI & Cloud Solution Architect',
    company: 'FinTech Global Enterprise',
    targetRole: 'Principal AI & Cloud Solution Architect',
    text: `We are seeking a Principal AI & Cloud Solution Architect with 15+ years of engineering experience to lead our Generative AI and Multi-Cloud transformation in Banking & Payments.
Key Requirements:
- Deep architecture expertise in Python, FastAPI, LangChain, CrewAI, RAG, Vector Databases, Semantic Search, and Agentic Workflows.
- Production deployments on AWS Bedrock, Azure OpenAI, Azure AI Foundry, or GCP Vertex AI.
- Strong foundation in Java 21, Spring Boot, Microservices, Kafka, and Event-Driven Architecture.
- Experience with Kubernetes (EKS/AKS/GKE), Serverless, Terraform, Docker, and CI/CD pipelines.
- Security governance using OAuth 2.0, OpenID Connect (OIDC), JWT, RBAC, and OWASP standards.
- Proven leadership mentoring engineering pods and driving AI-assisted development with GitHub Copilot or Claude Code.`,
    tailoredSummary:
      'Principal AI & Cloud Solution Architect with 16+ years of software engineering experience, including 7+ years architecting enterprise-grade platforms and autonomous Generative AI ecosystems across Banking, Payments, and Fintech domains. Proven authority in designing multi-cloud agentic architectures across AWS Bedrock, Azure OpenAI, and GCP Vertex AI using Python, FastAPI, LangChain, CrewAI, RAG, and vector databases. Combines cutting-edge AI engineering with deep mastery of resilient Java 21 / Spring Boot microservices, Kafka event-driven pipelines, and strict OAuth 2.0 / OIDC regulatory security.',
  },
  {
    id: 'jd-java-banking',
    title: 'Enterprise Java Microservices Architect',
    company: 'Tier-1 Investment Bank',
    targetRole: 'Enterprise Java Solution Architect',
    text: `Looking for an Enterprise Java Solution Architect to modernize core payments and banking platforms.
Key Requirements:
- 14+ years hands-on experience in Core Java, Java 21, Spring Boot, Spring Security, Hibernate/JPA, and RESTful APIs.
- Proven track record migrating legacy monoliths (SOAP/J2EE) to cloud-native microservices on AWS (ECS, EKS, Lambda, API Gateway, RDS, S3) and Azure (AKS, Container Apps, APIM).
- High-throughput messaging & caching with Kafka, Redis, PostgreSQL, and Oracle.
- Strong focus on resilience patterns (rate limiters, circuit breakers, retry logic), TDD, JUnit, Mockito, and SonarQube quality gates.`,
    tailoredSummary:
      'Enterprise Java Solution Architect and Technical Lead with 16+ years of software engineering experience modernizing mission-critical Banking, Payments, and Fintech platforms. Primary design authority in migrating legacy monoliths into high-availability, cloud-native Java 21 and Spring Boot microservices across AWS and Azure. Expert in distributed API Gateway security (OAuth 2.0, JWT), resilience patterns, Kafka event streaming, Hibernate/JPA optimization, and automated CI/CD quality gates.',
  },
  {
    id: 'jd-fullstack-lead',
    title: 'Full-Stack Engineering Lead (Angular/React + Cloud)',
    company: 'HealthTech & Life Sciences Innovator',
    targetRole: 'Full-Stack Technical Lead / Solution Architect',
    text: `Seeking a Full-Stack Technical Lead / Architect for regulated Healthcare & Clinical platforms (GxP).
Key Requirements:
- Strong front-end architecture using Angular, React, TypeScript, and modern SPAs for complex enterprise data visualization.
- Backend API mastery using Java Spring Boot and Python FastAPI microservices.
- Experience operating in GxP-regulated clinical, pharmaceutical, or healthcare environments.
- Cloud infrastructure across AWS, Azure, and GCP with DevOps automation (GitHub Actions, Azure DevOps, Docker) and Microsoft Power Platform low-code automation.`,
    tailoredSummary:
      'Full-Stack Technical Lead & Solution Architect with 16+ years of experience delivering high-performance enterprise SPAs and cloud-native microservices across GxP-regulated Healthcare, Clinical, and Financial domains. Expert in architecting interactive Angular and React/TypeScript front-end dashboards paired with scalable Java Spring Boot and Python FastAPI backends across AWS, Azure, and GCP.',
  },
];
