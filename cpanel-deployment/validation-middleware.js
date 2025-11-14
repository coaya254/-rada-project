// Simple validation middleware for admin endpoints

// Validate politician data
const validatePolitician = (req, res, next) => {
  const { name, party, position } = req.body;

  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required and must be a string' });
  }

  if (!party || typeof party !== 'string' || party.trim() === '') {
    errors.push({ field: 'party', message: 'Party is required and must be a string' });
  }

  if (!position || typeof position !== 'string' || position.trim() === '') {
    errors.push({ field: 'position', message: 'Position is required and must be a string' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate timeline event data
const validateTimelineEvent = (req, res, next) => {
  const { politician_id, title, description, date } = req.body;

  const errors = [];

  if (!politician_id || !Number.isInteger(Number(politician_id))) {
    errors.push({ field: 'politician_id', message: 'Politician ID is required and must be a number' });
  }

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push({ field: 'title', message: 'Title is required and must be a string' });
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    errors.push({ field: 'description', message: 'Description is required and must be a string' });
  }

  if (!date || isNaN(Date.parse(date))) {
    errors.push({ field: 'date', message: 'Valid date is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate commitment data
const validateCommitment = (req, res, next) => {
  const { politician_id, promise, description, category, date_made } = req.body;

  const errors = [];

  if (!politician_id || !Number.isInteger(Number(politician_id))) {
    errors.push({ field: 'politician_id', message: 'Politician ID is required and must be a number' });
  }

  if (!promise || typeof promise !== 'string' || promise.trim() === '') {
    errors.push({ field: 'promise', message: 'Promise is required and must be a string' });
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    errors.push({ field: 'description', message: 'Description is required and must be a string' });
  }

  if (!category || typeof category !== 'string' || category.trim() === '') {
    errors.push({ field: 'category', message: 'Category is required and must be a string' });
  }

  if (!date_made || isNaN(Date.parse(date_made))) {
    errors.push({ field: 'date_made', message: 'Valid date is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate voting record data
const validateVotingRecord = (req, res, next) => {
  const { politician_id, bill_title, bill_number, vote_date, vote_value } = req.body;

  const errors = [];

  if (!politician_id || !Number.isInteger(Number(politician_id))) {
    errors.push({ field: 'politician_id', message: 'Politician ID is required and must be a number' });
  }

  if (!bill_title || typeof bill_title !== 'string' || bill_title.trim() === '') {
    errors.push({ field: 'bill_title', message: 'Bill title is required and must be a string' });
  }

  if (!bill_number || typeof bill_number !== 'string' || bill_number.trim() === '') {
    errors.push({ field: 'bill_number', message: 'Bill number is required and must be a string' });
  }

  if (!vote_date || isNaN(Date.parse(vote_date))) {
    errors.push({ field: 'vote_date', message: 'Valid vote date is required' });
  }

  if (!vote_value || !['yes', 'no', 'abstain'].includes(vote_value.toLowerCase())) {
    errors.push({ field: 'vote_value', message: 'Vote value must be yes, no, or abstain' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate document data
const validateDocument = (req, res, next) => {
  const { politician_id, title, type, date_published } = req.body;

  const errors = [];

  if (!politician_id || !Number.isInteger(Number(politician_id))) {
    errors.push({ field: 'politician_id', message: 'Politician ID is required and must be a number' });
  }

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push({ field: 'title', message: 'Title is required and must be a string' });
  }

  if (!type || typeof type !== 'string' || type.trim() === '') {
    errors.push({ field: 'type', message: 'Type is required and must be a string' });
  }

  if (!date_published || isNaN(Date.parse(date_published))) {
    errors.push({ field: 'date_published', message: 'Valid date published is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate news data
const validateNews = (req, res, next) => {
  const { title, description, source, published_date } = req.body;

  const errors = [];

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push({ field: 'title', message: 'Title is required and must be a string' });
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    errors.push({ field: 'description', message: 'Description is required and must be a string' });
  }

  if (!source || typeof source !== 'string' || source.trim() === '') {
    errors.push({ field: 'source', message: 'Source is required and must be a string' });
  }

  if (!published_date || isNaN(Date.parse(published_date))) {
    errors.push({ field: 'published_date', message: 'Valid published date is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate admin user data
const validateAdminUser = (req, res, next) => {
  const { username, email, password, role } = req.body;

  const errors = [];

  if (!username || typeof username !== 'string' || username.trim() === '') {
    errors.push({ field: 'username', message: 'Username is required and must be a string' });
  } else if (username.length < 3) {
    errors.push({ field: 'username', message: 'Username must be at least 3 characters' });
  }

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  if (password !== undefined) {
    if (typeof password !== 'string' || password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }
  }

  if (!role || !['super_admin', 'admin', 'editor'].includes(role)) {
    errors.push({ field: 'role', message: 'Role must be super_admin, admin, or editor' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
  }

  next();
};

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  validatePolitician,
  validateTimelineEvent,
  validateCommitment,
  validateVotingRecord,
  validateDocument,
  validateNews,
  validateAdminUser
};
