# 🔍 Database Debug Checklist

I've added extensive debugging to the Daily Summary component. Here's how to diagnose the issue:

## 🚀 **Test Steps:**

### **1. Start the App:**
```bash
npm run dev
```

### **2. Check the Browser Console:**
- Open Developer Tools (F12)
- Go to Console tab
- Look for console.log messages from the TodaySummary component

### **3. Look for Debug Information:**
The new component will show:
- User ID status
- Total meals count
- Raw meal data
- Nutrition totals
- Any error messages

## 🔧 **What the Debug Version Shows:**

### **Debug Info Card:**
- User ID: Should show your user UUID
- Total Meals: Number of meals found
- Error: Any database errors
- Totals: Calculated nutrition values

### **Meal Data Card:**
- All meals in your database
- Each meal's name, date, and nutrition values
- Raw data structure

## 🎯 **Common Issues & Solutions:**

### **Issue 1: "No meals found"**
- **Cause:** Meals table might be empty or user_id mismatch
- **Fix:** Check if meals exist in Supabase dashboard
- **Action:** Add a meal first, then check summary

### **Issue 2: "Not loaded" for user**
- **Cause:** Authentication issue
- **Fix:** Check if you're logged in
- **Action:** Sign out and sign back in

### **Issue 3: "Failed to fetch meals"**
- **Cause:** Database permissions or network issue
- **Fix:** Check RLS policies in Supabase
- **Action:** Verify meals table exists and has data

### **Issue 4: Macro values showing as 0**
- **Cause:** Column name mismatch (fat vs fats)
- **Fix:** Check your meals table column names
- **Action:** Verify database schema

## 📊 **What to Check in Supabase:**

### **Meals Table Structure:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'meals' 
ORDER BY ordinal_position;
```

### **Sample Data:**
```sql
SELECT * FROM meals WHERE user_id = 'your-user-id' LIMIT 5;
```

### **Today's Meals:**
```sql
SELECT * FROM meals 
WHERE user_id = 'your-user-id' 
AND created_at >= CURRENT_DATE;
```

## 🔧 **Quick Fix Tests:**

### **Test 1: Add a New Meal**
1. Go to Add Meal page
2. Add a meal with nutrition data
3. Check if it appears in the debug summary

### **Test 2: Check User ID**
1. Look at the debug info card
2. Note the User ID shown
3. In Supabase, run: `SELECT * FROM meals WHERE user_id = 'that-id'`

### **Test 3: Check Column Names**
1. Look at the meal data in debug card
2. Note the field names (calories, protein, etc.)
3. Verify they match what you're adding

## 🎯 **Expected Results:**

### **Working Correctly:**
- User ID shows a UUID
- Meals appear with nutrition data
- Totals calculate correctly
- No error messages

### **Common Problems:**
- User ID is null/not loaded
- Meals array is empty
- Macro values are undefined/null
- Database connection errors

## 📞 **Next Steps:**

1. **Start the app** and check the debug information
2. **Look at browser console** for detailed logs
3. **Tell me what you see** in the debug cards
4. **Share any error messages** from console

This will help me identify the exact issue and fix it properly!