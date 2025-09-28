import { createUser, createKid, createPayment, CreateUserData } from '@/lib/database';

// Test users data with their credentials
export const testUsersData = [
  {
    email: 'parent1@test.com',
    password: '123456',
    name: 'John Smith',
    phone: '+1234567801',
    role: 'parent' as const,
    kids: [
      { name: 'Emma Smith', age: 8, team: 'Lions', position: 'Forward' },
      { name: 'Liam Smith', age: 10, team: 'Tigers', position: 'Midfielder' }
    ]
  },
  {
    email: 'parent2@test.com',
    password: '123456',
    name: 'Sarah Johnson',
    phone: '+1234567802',
    role: 'parent' as const,
    kids: [
      { name: 'Olivia Johnson', age: 9, team: 'Eagles', position: 'Defender' }
    ]
  },
  {
    email: 'parent3@test.com',
    password: '123456',
    name: 'Mike Davis',
    phone: '+1234567803',
    role: 'parent' as const,
    kids: [
      { name: 'Noah Davis', age: 7, team: 'Lions', position: 'Goalkeeper' },
      { name: 'Ava Davis', age: 11, team: 'Panthers', position: 'Forward' }
    ]
  },
  {
    email: 'parent4@test.com',
    password: '123456',
    name: 'Emily Wilson',
    phone: '+1234567804',
    role: 'parent' as const,
    kids: [
      { name: 'Mason Wilson', age: 6, team: 'Cubs', position: 'Midfielder' }
    ]
  },
  {
    email: 'parent5@test.com',
    password: '123456',
    name: 'David Brown',
    phone: '+1234567805',
    role: 'parent' as const,
    kids: [
      { name: 'Sophia Brown', age: 12, team: 'Hawks', position: 'Captain' },
      { name: 'Jackson Brown', age: 8, team: 'Lions', position: 'Defender' }
    ]
  },
  {
    email: 'parent6@test.com',
    password: '123456',
    name: 'Lisa Garcia',
    phone: '+1234567806',
    role: 'parent' as const,
    kids: [
      { name: 'Isabella Garcia', age: 9, team: 'Eagles', position: 'Midfielder' }
    ]
  },
  {
    email: 'parent7@test.com',
    password: '123456',
    name: 'James Miller',
    phone: '+1234567807',
    role: 'parent' as const,
    kids: [
      { name: 'Ethan Miller', age: 10, team: 'Tigers', position: 'Forward' },
      { name: 'Mia Miller', age: 7, team: 'Cubs', position: 'Defender' }
    ]
  },
  {
    email: 'parent8@test.com',
    password: '123456',
    name: 'Jennifer Martinez',
    phone: '+1234567808',
    role: 'parent' as const,
    kids: [
      { name: 'Alexander Martinez', age: 11, team: 'Panthers', position: 'Midfielder' }
    ]
  },
  {
    email: 'parent9@test.com',
    password: '123456',
    name: 'Robert Anderson',
    phone: '+1234567809',
    role: 'parent' as const,
    kids: [
      { name: 'Charlotte Anderson', age: 8, team: 'Lions', position: 'Forward' },
      { name: 'Benjamin Anderson', age: 6, team: 'Cubs', position: 'Goalkeeper' }
    ]
  },
  {
    email: 'parent10@test.com',
    password: '123456',
    name: 'Jessica Taylor',
    phone: '+1234567810',
    role: 'parent' as const,
    kids: [
      { name: 'Amelia Taylor', age: 12, team: 'Hawks', position: 'Defender' }
    ]
  },
  {
    email: 'parent11@test.com',
    password: '123456',
    name: 'Christopher Thomas',
    phone: '+1234567811',
    role: 'parent' as const,
    kids: [
      { name: 'Harper Thomas', age: 9, team: 'Eagles', position: 'Midfielder' },
      { name: 'Lucas Thomas', age: 7, team: 'Cubs', position: 'Forward' }
    ]
  },
  {
    email: 'parent12@test.com',
    password: '123456',
    name: 'Amanda Jackson',
    phone: '+1234567812',
    role: 'parent' as const,
    kids: [
      { name: 'Evelyn Jackson', age: 10, team: 'Tigers', position: 'Captain' }
    ]
  },
  {
    email: 'parent13@test.com',
    password: '123456',
    name: 'Matthew White',
    phone: '+1234567813',
    role: 'parent' as const,
    kids: [
      { name: 'Abigail White', age: 8, team: 'Lions', position: 'Defender' },
      { name: 'Henry White', age: 11, team: 'Panthers', position: 'Midfielder' }
    ]
  },
  {
    email: 'parent14@test.com',
    password: '123456',
    name: 'Ashley Harris',
    phone: '+1234567814',
    role: 'parent' as const,
    kids: [
      { name: 'Ella Harris', age: 6, team: 'Cubs', position: 'Forward' }
    ]
  },
  {
    email: 'parent15@test.com',
    password: '123456',
    name: 'Daniel Martin',
    phone: '+1234567815',
    role: 'parent' as const,
    kids: [
      { name: 'Elizabeth Martin', age: 12, team: 'Hawks', position: 'Goalkeeper' },
      { name: 'Sebastian Martin', age: 9, team: 'Eagles', position: 'Defender' }
    ]
  },
  {
    email: 'parent16@test.com',
    password: '123456',
    name: 'Michelle Thompson',
    phone: '+1234567816',
    role: 'parent' as const,
    kids: [
      { name: 'Sofia Thompson', age: 7, team: 'Cubs', position: 'Midfielder' }
    ]
  },
  {
    email: 'parent17@test.com',
    password: '123456',
    name: 'Joshua Garcia',
    phone: '+1234567817',
    role: 'parent' as const,
    kids: [
      { name: 'Avery Garcia', age: 10, team: 'Tigers', position: 'Forward' },
      { name: 'Scarlett Garcia', age: 8, team: 'Lions', position: 'Midfielder' }
    ]
  },
  {
    email: 'parent18@test.com',
    password: '123456',
    name: 'Stephanie Rodriguez',
    phone: '+1234567818',
    role: 'parent' as const,
    kids: [
      { name: 'Victoria Rodriguez', age: 11, team: 'Panthers', position: 'Captain' }
    ]
  },
  {
    email: 'parent19@test.com',
    password: '123456',
    name: 'Andrew Lewis',
    phone: '+1234567819',
    role: 'parent' as const,
    kids: [
      { name: 'Grace Lewis', age: 9, team: 'Eagles', position: 'Defender' },
      { name: 'Owen Lewis', age: 6, team: 'Cubs', position: 'Forward' }
    ]
  },
  {
    email: 'parent20@test.com',
    password: '123456',
    name: 'Nicole Walker',
    phone: '+1234567820',
    role: 'parent' as const,
    kids: [
      { name: 'Chloe Walker', age: 12, team: 'Hawks', position: 'Midfielder' },
      { name: 'Carter Walker', age: 7, team: 'Cubs', position: 'Goalkeeper' }
    ]
  }
];

export const addTestData = async () => {
  console.log('🚀 Starting to add test data...');
  
  try {
    for (let i = 0; i < testUsersData.length; i++) {
      const userData = testUsersData[i];
      console.log(`📝 Creating user ${i + 1}/20: ${userData.name} (${userData.email})`);
      
      // Create the parent user
      const user = await createUser({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
        role: userData.role
      });
      
      console.log(`✅ User created: ${user.name} with ID: ${user.id}`);
      
      // Create kids for this parent
      for (const kidData of userData.kids) {
        const kid = await createKid({
          parentId: user.id,
          name: kidData.name,
          age: kidData.age,
          team: kidData.team,
          position: kidData.position
        });
        console.log(`👶 Kid created: ${kid.name} (${kid.age} years old, ${kid.team} - ${kid.position})`);
      }
      
      // Create some sample payments for each parent
      const paymentDescriptions = [
        'Monthly Training Fee',
        'Tournament Registration',
        'Equipment Fee',
        'Team Jersey',
        'Field Rental'
      ];
      
      const randomPayments = Math.floor(Math.random() * 3) + 1; // 1-3 payments per parent
      for (let j = 0; j < randomPayments; j++) {
        const amount = Math.floor(Math.random() * 200) + 50; // $50-$250
        const description = paymentDescriptions[Math.floor(Math.random() * paymentDescriptions.length)];
        const statuses: ('pending' | 'paid' | 'overdue')[] = ['pending', 'paid', 'overdue'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const payment = await createPayment({
          parentId: user.id,
          amount,
          description,
          status,
          dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within 30 days
          paidDate: status === 'paid' ? new Date().toISOString() : undefined
        });
        
        console.log(`💰 Payment created: $${amount} - ${description} (${status})`);
      }
      
      console.log(`✨ Completed user ${i + 1}/20\n`);
    }
    
    console.log('🎉 All test data has been successfully added!');
    console.log('\n📋 CREDENTIALS SUMMARY:');
    console.log('='.repeat(50));
    console.log('ADMIN ACCOUNT:');
    console.log('Email: admin@example.com');
    console.log('Password: 123456');
    console.log('Role: admin');
    console.log('\n' + '='.repeat(50));
    console.log('PARENT ACCOUNTS:');
    testUsersData.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Kids: ${user.kids.map(kid => `${kid.name} (${kid.age}, ${kid.team})`).join(', ')}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error adding test data:', error);
    throw error;
  }
};