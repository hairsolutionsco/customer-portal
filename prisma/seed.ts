import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

function generatePassword(): string {
  return process.env.SEED_DEFAULT_PASSWORD || crypto.randomBytes(16).toString('hex')
}

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const adminPw = generatePassword()
  const adminPassword = await bcrypt.hash(adminPw, 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hairsolutions.co' },
    update: {},
    create: {
      email: 'admin@hairsolutions.co',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  })
  console.log('✅ Admin user created:', admin.email, '| password:', adminPw)

  // Create support user
  const supportPw = generatePassword()
  const supportPassword = await bcrypt.hash(supportPw, 12)
  const support = await prisma.user.upsert({
    where: { email: 'support@hairsolutions.co' },
    update: {},
    create: {
      email: 'support@hairsolutions.co',
      name: 'Support Team',
      password: supportPassword,
      role: UserRole.SUPPORT,
      emailVerified: new Date(),
    },
  })
  console.log('✅ Support user created:', support.email, '| password:', supportPw)

  // Create demo customer
  const customerPw = generatePassword()
  const customerPassword = await bcrypt.hash(customerPw, 12)
  const customer = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo Customer',
      password: customerPassword,
      role: UserRole.CUSTOMER,
      emailVerified: new Date(),
      phone: '+1-555-0123',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
      },
    },
  })
  console.log('✅ Demo customer created:', customer.email, '| password:', customerPw)

  // Create hair profile for demo customer
  const hairProfile = await prisma.hairProfile.upsert({
    where: { userId: customer.id },
    update: {},
    create: {
      userId: customer.id,
      headCircumference: 57.5,
      frontToNape: 35.0,
      earToEar: 32.0,
      templeToTemple: 28.0,
      preferredStyle: 'Natural Wave',
      density: 'Medium',
      hairColor: 'Dark Brown (#3)',
      baseType: 'Swiss Lace',
      attachmentMethod: 'Tape',
      activityLevel: 'Moderate',
      sweatingLevel: 'Moderate',
      workEnvironment: 'Office',
      sportsActivities: ['Swimming', 'Gym'],
      onboardingCompleted: true,
      onboardingStep: 5,
    },
  })
  console.log('✅ Hair profile created for demo customer')

  // Create customization templates
  const defaultTemplate = await prisma.customizationTemplate.create({
    data: {
      userId: customer.id,
      name: 'Standard System',
      baseType: 'Swiss Lace',
      hairColor: 'Dark Brown (#3)',
      density: 'Medium',
      hairLength: '6 inches',
      style: 'Natural Wave',
      attachmentMethod: 'Tape',
      isDefault: true,
      additionalOptions: {
        hairlineType: 'Natural',
        greyPercentage: 5,
        highlights: false,
      },
    },
  })
  console.log('✅ Default customization template created')

  // Create subscription plans
  const plans = await Promise.all([
    prisma.subscriptionPlan.upsert({
      where: { name: 'Basic Plan' },
      update: {},
      create: {
        name: 'Basic Plan',
        description: 'Perfect for getting started with hair systems',
        price: 299.00,
        currency: 'USD',
        interval: 'month',
        intervalCount: 3,
        features: [
          '1 hair system every 3 months',
          'Standard shipping',
          'Email support',
          'Access to maintenance shop',
        ],
        systemsPerYear: 4,
        defaultProductionFrequency: 90,
        isActive: true,
        displayOrder: 1,
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { name: 'Premium Plan' },
      update: {},
      create: {
        name: 'Premium Plan',
        description: 'Our most popular plan with enhanced features',
        price: 499.00,
        currency: 'USD',
        interval: 'month',
        intervalCount: 2,
        features: [
          '1 hair system every 2 months',
          'Priority production',
          'Express shipping',
          'Priority support',
          '10% off maintenance products',
          'Free styling consultation',
        ],
        systemsPerYear: 6,
        defaultProductionFrequency: 60,
        isActive: true,
        displayOrder: 2,
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { name: 'VIP Plan' },
      update: {},
      create: {
        name: 'VIP Plan',
        description: 'Ultimate care with monthly systems',
        price: 799.00,
        currency: 'USD',
        interval: 'month',
        intervalCount: 1,
        features: [
          '1 hair system every month',
          'VIP priority production',
          'Free overnight shipping',
          '24/7 dedicated support',
          '15% off maintenance products',
          'Free styling consultations',
          'Backup system option',
        ],
        systemsPerYear: 12,
        defaultProductionFrequency: 30,
        isActive: true,
        displayOrder: 3,
      },
    }),
  ])
  console.log('✅ Subscription plans created:', plans.length)

  // Create products for mini shop
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Premium Hair System Shampoo',
        slug: 'premium-hair-system-shampoo',
        description: 'Specially formulated shampoo for hair systems. Gentle cleaning without damaging the base or hair fibers.',
        shortDescription: 'Gentle cleaning for hair systems',
        price: 24.99,
        compareAtPrice: 29.99,
        category: 'shampoo',
        images: ['/products/shampoo.jpg'],
        primaryImage: '/products/shampoo.jpg',
        inStock: true,
        stockQuantity: 150,
        featured: true,
        displayOrder: 1,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Hair System Conditioner',
        slug: 'hair-system-conditioner',
        description: 'Moisturizing conditioner that keeps your hair system soft and manageable.',
        shortDescription: 'Keep your system soft and healthy',
        price: 26.99,
        category: 'conditioner',
        images: ['/products/conditioner.jpg'],
        primaryImage: '/products/conditioner.jpg',
        inStock: true,
        stockQuantity: 120,
        featured: true,
        displayOrder: 2,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Ultra-Hold Tape Strips (36 pieces)',
        slug: 'ultra-hold-tape-strips',
        description: 'Professional-grade double-sided tape strips. Waterproof and sweat-resistant, holds for 2-4 weeks.',
        shortDescription: 'Strong hold tape strips',
        price: 19.99,
        category: 'tape',
        images: ['/products/tape.jpg'],
        primaryImage: '/products/tape.jpg',
        inStock: true,
        stockQuantity: 200,
        featured: true,
        displayOrder: 3,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Professional Adhesive Remover',
        slug: 'adhesive-remover',
        description: 'Gentle yet effective adhesive remover. Oil-based formula that protects your skin and scalp.',
        shortDescription: 'Safe adhesive removal',
        price: 22.99,
        category: 'adhesive',
        images: ['/products/remover.jpg'],
        primaryImage: '/products/remover.jpg',
        inStock: true,
        stockQuantity: 100,
        featured: false,
        displayOrder: 4,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Scalp Protector Spray',
        slug: 'scalp-protector-spray',
        description: 'Creates a protective barrier on your scalp before applying adhesives. Reduces irritation and improves adhesive performance.',
        shortDescription: 'Protect your scalp',
        price: 18.99,
        category: 'scalp-care',
        images: ['/products/protector.jpg'],
        primaryImage: '/products/protector.jpg',
        inStock: true,
        stockQuantity: 80,
        featured: false,
        displayOrder: 5,
      },
    }),
  ])
  console.log('✅ Products created:', products.length)

  // Create sample order for demo customer
  const order = await prisma.order.create({
    data: {
      orderNumber: 'HS-2024-0001',
      userId: customer.id,
      customizationTemplateId: defaultTemplate.id,
      productName: 'Custom Hair System - Natural Wave',
      configurationSnapshot: {
        baseType: 'Swiss Lace',
        hairColor: 'Dark Brown (#3)',
        density: 'Medium',
        hairLength: '6 inches',
        style: 'Natural Wave',
        attachmentMethod: 'Tape',
      },
      status: 'IN_PRODUCTION',
      productionStage: 'HAIR_VENTILATION',
      subtotal: 499.00,
      tax: 39.92,
      shipping: 15.00,
      total: 553.92,
      currency: 'USD',
      estimatedProductionStart: new Date('2024-01-15'),
      estimatedCompletion: new Date('2024-02-15'),
    },
  })
  console.log('✅ Sample order created:', order.orderNumber)

  // Create order status history
  await prisma.orderStatusHistory.createMany({
    data: [
      {
        orderId: order.id,
        status: 'PENDING',
        stage: 'AWAITING_CONFIRMATION',
        notes: 'Order received and awaiting customization confirmation',
        createdBy: 'system',
        createdAt: new Date('2024-01-10'),
      },
      {
        orderId: order.id,
        status: 'CONFIRMED',
        stage: 'MATERIALS_PREPARATION',
        notes: 'Customization confirmed, materials being prepared',
        createdBy: customer.id,
        createdAt: new Date('2024-01-12'),
      },
      {
        orderId: order.id,
        status: 'IN_PRODUCTION',
        stage: 'BASE_CONSTRUCTION',
        notes: 'Base construction completed',
        createdBy: 'system',
        createdAt: new Date('2024-01-20'),
      },
      {
        orderId: order.id,
        status: 'IN_PRODUCTION',
        stage: 'HAIR_VENTILATION',
        notes: 'Hair ventilation in progress',
        createdBy: 'system',
        createdAt: new Date('2024-01-25'),
      },
    ],
  })
  console.log('✅ Order status history created')

  // Create invoice for the order
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-0001',
      userId: customer.id,
      orderId: order.id,
      amount: 499.00,
      tax: 39.92,
      total: 553.92,
      currency: 'USD',
      status: 'PAID',
      issueDate: new Date('2024-01-10'),
      dueDate: new Date('2024-01-20'),
      paidAt: new Date('2024-01-10'),
    },
  })
  console.log('✅ Invoice created:', invoice.invoiceNumber)

  // Create affiliated locations
  const locations = await Promise.all([
    prisma.affiliatedLocation.create({
      data: {
        name: 'Hair Solutions NYC - Manhattan',
        slug: 'hair-solutions-nyc-manhattan',
        country: 'USA',
        state: 'New York',
        city: 'New York',
        address: '123 5th Avenue, Suite 500',
        postalCode: '10001',
        phone: '+1-212-555-0100',
        email: 'manhattan@hairsolutions.co',
        website: 'https://nyc.hairsolutions.co',
        servicesOffered: ['Consultation', 'Fitting', 'Styling', 'Maintenance'],
        specialties: ['Men\'s Hair Systems', 'Women\'s Hair Systems', 'Medical Hair Loss'],
        latitude: 40.7484,
        longitude: -73.9857,
        description: 'Our flagship location in the heart of Manhattan. Full-service hair restoration center.',
        isActive: true,
        isFeatured: true,
        displayOrder: 1,
      },
    }),
    prisma.affiliatedLocation.create({
      data: {
        name: 'Hair Solutions LA - Beverly Hills',
        slug: 'hair-solutions-la-beverly-hills',
        country: 'USA',
        state: 'California',
        city: 'Los Angeles',
        address: '456 Rodeo Drive',
        postalCode: '90210',
        phone: '+1-310-555-0200',
        email: 'la@hairsolutions.co',
        website: 'https://la.hairsolutions.co',
        servicesOffered: ['Consultation', 'Fitting', 'Styling', 'Maintenance', 'Custom Coloring'],
        specialties: ['Celebrity Clientele', 'Premium Systems', 'Quick Service'],
        latitude: 34.0696,
        longitude: -118.4051,
        isActive: true,
        isFeatured: true,
        displayOrder: 2,
      },
    }),
    prisma.affiliatedLocation.create({
      data: {
        name: 'Hair Solutions London - Mayfair',
        slug: 'hair-solutions-london-mayfair',
        country: 'UK',
        city: 'London',
        address: '10 Bond Street',
        postalCode: 'W1S 1SP',
        phone: '+44-20-7123-4567',
        email: 'london@hairsolutions.co',
        website: 'https://uk.hairsolutions.co',
        servicesOffered: ['Consultation', 'Fitting', 'Styling', 'Maintenance'],
        specialties: ['European Hair Types', 'Discreet Service'],
        latitude: 51.5123,
        longitude: -0.1416,
        isActive: true,
        isFeatured: true,
        displayOrder: 3,
      },
    }),
  ])
  console.log('✅ Affiliated locations created:', locations.length)

  // Create help articles
  const articles = await Promise.all([
    prisma.helpArticle.create({
      data: {
        title: 'Getting Started with Your New Hair System',
        slug: 'getting-started-with-your-new-hair-system',
        content: `# Getting Started with Your New Hair System

Welcome to Hair Solutions! This guide will help you get the most out of your new hair system.

## Initial Setup

When you receive your hair system, it will arrive professionally styled and ready to wear. However, here are some important first steps:

1. **Inspection**: Check your system for any shipping damage
2. **Washing**: We recommend washing before first wear
3. **Preparation**: Prepare your scalp with our protector spray

## Application

Your hair system can be attached using several methods...`,
        excerpt: 'Learn how to set up and care for your new hair system',
        category: 'getting-started',
        tags: ['basics', 'new-customer', 'setup'],
        featured: true,
        displayOrder: 1,
        isPublished: true,
      },
    }),
    prisma.helpArticle.create({
      data: {
        title: 'Daily Care and Maintenance Guide',
        slug: 'daily-care-and-maintenance-guide',
        content: `# Daily Care and Maintenance

Proper daily care will extend the life of your hair system and keep it looking natural.

## Daily Routine

- Gentle brushing with a wide-tooth comb
- Avoid harsh chemicals
- Use recommended products only

## Weekly Care

- Deep conditioning treatment
- Check adhesive integrity
- Clean the base`,
        excerpt: 'Keep your hair system looking its best with proper daily care',
        category: 'maintenance',
        tags: ['care', 'maintenance', 'daily-routine'],
        featured: true,
        displayOrder: 2,
        isPublished: true,
      },
    }),
  ])
  console.log('✅ Help articles created:', articles.length)

  console.log('✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
