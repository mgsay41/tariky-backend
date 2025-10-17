import { PrismaClient, CourseLevel, CourseType, CourseStatus, CourseProviderStatus, InstructorClass } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Admin
  console.log('Creating Admin...');
  const admin = await prisma.admin.upsert({
    where: { id: 'cmfbe1hmx00000tfscoith99x' },
    update: {},
    create: {
      id: 'cmfbe1hmx00000tfscoith99x',
      firstName: 'Tariky',
      lastName: 'Admin',
      email: 'admin@tariky.net',
      password: await bcrypt.hash('admin123', 12),
      phoneNumber: '+20 100 000 0000',
      profilePicture: 'https://i.postimg.cc/zXv2dm3M/Untitled-design.jpg',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // 2. Create Course Categories
  console.log('\nCreating Course Categories...');
  const categories = [
    {
      id: 1,
      name: 'Web Development',
      slug: 'web_development',
      description: 'Comes corpus coma urbs. Non acsi tripudio vox ipsum accommodo at enim. Cicuta aspernatur tactus ascit cohibeo.',
      icon: '🌐',
      color: '#3B82F6',
    },
    {
      id: 2,
      name: 'Mobile Development',
      slug: 'mobile_development',
      description: 'Valde careo vehemens tredecim triduana. Nostrum rem vorax. Celebrer texo audentia ullus.',
      icon: '📱',
      color: '#10B981',
    },
    {
      id: 3,
      name: 'Data Science',
      slug: 'data_science',
      description: 'Tabella adipisci decumbo doloremque pauci cribro substantia attonbitus facilis alius. Cuppedia traho in cui adicio. Trado aut corporis vorax contra.',
      icon: '📊',
      color: '#8B5CF6',
    },
    {
      id: 4,
      name: 'Artificial Intelligence',
      slug: 'artificial_intelligence',
      description: 'Pariatur voluptatum ipsum labore. Spes theca angulus collum perspiciatis tricesimus debeo. Officiis apto quaerat.',
      icon: '🤖',
      color: '#F59E0B',
    },
    {
      id: 5,
      name: 'DevOps',
      slug: 'devops',
      description: 'Totam asporto quas bestia vitium exercitationem ut. Pecus admoveo dolorum bibo deludo cultellus vulgo. Perferendis vomer sto audax universe convoco.',
      icon: '⚙️',
      color: '#EF4444',
    },
    {
      id: 6,
      name: 'Cybersecurity',
      slug: 'cybersecurity',
      description: 'Optio appositus similique. Valeo quo conor peior coniecto exercitationem caveo sopor advenio admoveo. Antiquus calcar ut certe strenuus verumtamen surgo laboriosam.',
      icon: '🔒',
      color: '#6366F1',
    },
    {
      id: 7,
      name: 'UI/UX Design',
      slug: 'uiux_design',
      description: 'Attonbitus thorax eos doloremque iusto eveniet error testimonium uterque benevolentia. Vicissitudo caterva depraedor articulus aro villa surculus abutor. Cumque villa defluo vulgo sumo tendo.',
      icon: '🎨',
      color: '#EC4899',
    },
    {
      id: 8,
      name: 'Cloud Computing',
      slug: 'cloud_computing',
      description: 'Textilis tenus statim. Tempora tollo ascisco pecto conventus. Iste bellicus vobis aestus avarus velit terror cur.',
      icon: '☁️',
      color: '#06B6D4',
    },
    {
      id: 9,
      name: 'AI & Data Science',
      slug: 'ai-data-science',
      description: 'Courses focused on Artificial Intelligence, Machine Learning, Data Analysis, and related technologies. Perfect for beginners and professionals looking to break into the AI field.',
      icon: '🤖',
      color: '#02BBB6',
    },
  ];

  for (const category of categories) {
    await prisma.courseCategory.upsert({
      where: { id: category.id },
      update: category,
      create: category,
    });
    console.log(`✅ Category created: ${category.name}`);
  }

  // 3. Create Course Provider
  console.log('\nCreating Course Provider...');
  const courseProvider = await prisma.courseProvider.upsert({
    where: { id: 'cmfbe1i8f00010tfs1uzqu9j5' },
    update: {},
    create: {
      id: 'cmfbe1i8f00010tfs1uzqu9j5',
      providerId: 6,
      companyName: 'Tariky',
      companyDescription: "Tariky is a leading educational technology company specializing in practical, hands-on learning experiences in AI, Data Science, and Programming. Founded in 2020, we focus on bridging the gap between academic knowledge and industry requirements through innovative learning methodologies. Our mission is to democratize AI education and empower the next generation of tech professionals with cutting-edge skills and real-world project experience.",
      website: 'https://tariky.net',
      email: 'inceptum.egypt@gmail.com',
      password: await bcrypt.hash('provider123', 12), // Using the hashed password from CSV
      phoneNumber: '+20 106 565 9008',
      address: '6th of October',
      city: '6th of October',
      country: 'Egypt',
      logo: 'https://i.postimg.cc/zXv2dm3M/Untitled-design.jpg',
      coverImage: 'https://i.postimg.cc/zXv2dm3M/Untitled-design.jpg',
      established: new Date('2020-01-01T00:00:00'),
      socialMediaLinks: {
        email: 'inceptum.egypt@gmail.com',
        website: 'https://tariky.net',
      },
      businessLicense: 'EG-2020-TARIKY-001',
      taxId: 'TAX-EG-TARIKY-2020',
      rating: 4.8,
      totalStudents: 0,
      totalCourses: 1,
      verified: true,
      status: CourseProviderStatus.APPROVED,
      adminId: admin.id,
    },
  });
  console.log('✅ Course Provider created:', courseProvider.companyName);

  // 4. Create Instructor
  console.log('\nCreating Instructor...');
  const instructor = await prisma.instructor.upsert({
    where: { id: 'cmfbe1jdv00020tfsap89qg6f' },
    update: {},
    create: {
      id: 'cmfbe1jdv00020tfsap89qg6f',
      firstName: 'Ahmed',
      lastName: 'Hassan',
      email: 'ahmed.hassan@tariky.net',
      password: await bcrypt.hash('instructor123', 12),
      phoneNumber: '+20 101 234 5678',
      age: 32,
      instructorClass: InstructorClass.A,
      rating: 4.9,
      totalRatings: 25,
      bio: 'Experienced AI and Machine Learning instructor with over 8 years of industry experience. Passionate about teaching and making AI accessible to beginners.',
      specialization: 'Artificial Intelligence & Machine Learning',
      experience: 8,
      expertise: ['Python', 'Machine Learning', 'Data Science', 'Deep Learning', 'TensorFlow', 'Scikit-learn'],
      certifications: ['AWS Certified Machine Learning - Specialty', 'Google TensorFlow Developer Certificate'],
      linkedinUrl: 'https://linkedin.com/in/ahmed-hassan',
      githubUrl: 'https://github.com/ahmed-hassan',
      portfolioUrl: 'https://ahmedhassan.dev',
      totalStudents: 150,
      totalCourses: 1,
      courseProviderId: courseProvider.id,
      profilePicture: 'https://i.postimg.cc/zXv2dm3M/Untitled-design.jpg',
    },
  });
  console.log('✅ Instructor created:', `${instructor.firstName} ${instructor.lastName}`);

  // 5. Create Course
  console.log('\nCreating Course: AI Basics Course...');
  const course = await prisma.course.upsert({
    where: { id: 16 },
    update: {},
    create: {
      id: 16,
      title: 'AI Basics Course',
      slug: 'ai-basics',
      description: `Are you curious about Artificial Intelligence but don't know where to start? This beginner-friendly, hands-on program takes you on a 1-month journey from the very basics of Python programming to building your first Machine Learning models.

Through a mix of live sessions, curated resources, interactive projects, and team challenges, you'll gain practical skills and the confidence to take your first steps into AI. This experience is not just about learning – it's about doing, sharing, and growing together.

Every week you'll build projects, discuss your progress with peers, and apply concepts to real-world problems. By the end of the program, you'll have a strong foundation in Python, Data Analysis, and Machine Learning – and a final team project to showcase on your portfolio.`,
      shortDescription: 'Learn Python, Data Analysis, and Machine Learning through live sessions, hands-on projects, and team challenges. Build real-world AI applications in just 1 month.',
      courseImage: 'https://i.postimg.cc/qMcx04gg/Original.png',
      courseFee: 2500.00,
      rating: 5,
      totalRatings: 10,
      level: CourseLevel.BEGINNER,
      duration: 30,
      courseType: CourseType.ONLINE,
      language: 'English',
      address: 'Villa 207, 6th of October',
      city: '6th of October',
      country: 'Egypt',
      venue: 'Villa 207',
      totalLessons: 12,
      totalProjects: 12,
      hasCapstoneProject: true,
      hasCertificate: true,
      prerequisites: [],
      learningOutcomes: [
        'Write and run Python programs to solve basic problems',
        'Use Pandas, NumPy, and Matplotlib to analyze and visualize data',
        'Explain key concepts of Machine Learning including regression, classification, and model evaluation',
        'Build and deploy beginner-friendly AI projects such as calculators, data analyzers, price predictors, and spam classifiers',
        'Collaborate with peers to design and pitch a team-based AI project',
        'Present your work confidently and showcase your projects in a portfolio-ready format',
        'Apply best practices to improve your CV and LinkedIn profile for AI career opportunities',
      ],
      courseOutline: `Module 1: Python Foundations
• Getting started with Python and your coding environment
• Variables, data types, and operators
• Loops, conditionals, and functions
• Quick Project: Python Calculator

Module 2: Data Analysis with Python
• Introduction to NumPy and Pandas
• Loading, cleaning, and transforming datasets
• Data visualization with Matplotlib and Seaborn
• Quick Project: Student Grades Analyzer

Module 3: Machine Learning Basics
• What is Machine Learning? Supervised vs. Unsupervised learning
• Introduction to Scikit-learn
• Training and testing models
• Building a regression model (House Price Predictor)
• Quick Project: House Price Predictor

Module 4: Applying Machine Learning
• Classification techniques (Logistic Regression, Decision Trees)
• Model evaluation (accuracy, precision, recall)
• Practical case studies in classification
• Quick Project: Email Spam Classifier

Final Sprint: The Garage
• Team-based challenge: Build a Smart Recommendation System
• 1-week collaborative sprint
• Apply Python, Data Analysis, and Machine Learning skills
• Team presentations and feedback

Closing Ceremony: Horizon
• Final project pitches
• 1:1 CV review and LinkedIn optimization session
• Peer recognition and certificates
• Competition: Winning team earns a 40% discount for the next experience`,
      maxStudents: 50,
      currentStudents: 0,
      startDate: new Date('2025-11-01T00:00:00'),
      endDate: new Date('2025-11-30T00:00:00'),
      enrollmentDeadline: new Date('2025-11-01T00:00:00'),
      instructorId: instructor.id,
      courseProviderId: courseProvider.id,
      adminId: admin.id,
      categoryId: 9, // AI & Data Science
      status: CourseStatus.PUBLISHED,
      paymentLink: 'https://www.easykash.net/AUG4117',
    },
  });
  console.log('✅ Course created:', course.title);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Admin: ${admin.email}`);
  console.log(`- Course Provider: ${courseProvider.companyName}`);
  console.log(`- Instructor: ${instructor.firstName} ${instructor.lastName}`);
  console.log(`- Categories: ${categories.length} categories`);
  console.log(`- Course: ${course.title}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
