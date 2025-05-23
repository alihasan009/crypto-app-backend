const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// إعداد الاتصال بـ Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// طريقة GET بسيطة للتحقق من أن الخادم يعمل
app.get('/', (req, res) => {
  res.json({ message: 'مرحباً بك في خادم تطبيق العملات الرقمية!' });
});

// تسجيل مستخدم جديد
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // التحقق من وجود المستخدم
    const { data: existingUsers, error: searchError } = await supabase
      .from('تعدين العملات المشفرة')
      .select('*')
      .eq('بريد إلكتروني', email);
    
    if (searchError) {
      console.error('خطأ في البحث عن المستخدم:', searchError);
      return res.status(500).json({ message: 'خطأ في الخادم أثناء البحث عن المستخدم' });
    }
    
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
    }
    
    // إنشاء مستخدم جديد
    const { data: newUser, error: insertError } = await supabase
      .from('تعدين العملات المشفرة')
      .insert([
        { 
          'بريد إلكتروني': email, 
          'اسم المستخدم': username, 
          'كلمة المرور': password
        }
      ])
      .select();
    
    if (insertError) {
      console.error('خطأ في إنشاء المستخدم:', insertError);
      return res.status(500).json({ message: 'خطأ في الخادم أثناء إنشاء المستخدم' });
    }
    
    res.status(201).json({
      message: 'تم إنشاء المستخدم بنجاح',
      user: newUser[0]
    });
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
});

// تسجيل الدخول
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // البحث عن المستخدم
    const { data: users, error } = await supabase
      .from('تعدين العملات المشفرة')
      .select('*')
      .eq('بريد إلكتروني', email)
      .eq('كلمة المرور', password);
    
    if (error) {
      console.error('خطأ في البحث عن المستخدم:', error);
      return res.status(500).json({ message: 'خطأ في الخادم أثناء البحث عن المستخدم' });
    }
    
    if (!users || users.length === 0) {
      return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      user: users[0]
    });
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
});

// إضافة معاملة جديدة
app.post('/api/transactions', async (req, res) => {
  try {
    const { user_id, amount, type, currency } = req.body;
    
    const { data: newTransaction, error } = await supabase
      .from('المعاملات')
      .insert([
        { 
          'معرف المستخدم': user_id, 
          'كمية': amount, 
          'يكتب': type,
          'عملة': currency,
          'تم إنشاؤه في': new Date()
        }
      ])
      .select();
    
    if (error) {
      console.error('خطأ في إنشاء المعاملة:', error);
      return res.status(500).json({ message: 'خطأ في الخادم أثناء إنشاء المعاملة' });
    }
    
    res.status(201).json({
      message: 'تم إنشاء المعاملة بنجاح',
      transaction: newTransaction[0]
    });
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
});

// الحصول على معاملات المستخدم
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const { data: transactions, error } = await supabase
      .from('المعاملات')
      .select('*')
      .eq('معرف المستخدم', userId);
    
    if (error) {
      console.error('خطأ في جلب المعاملات:', error);
      return res.status(500).json({ message: 'خطأ في الخادم أثناء جلب المعاملات' });
    }
    
    res.json({
      message: 'تم جلب المعاملات بنجاح',
      transactions: transactions
    });
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
});

// بدء تشغيل الخادم
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Connected to Supabase successfully`);
});
