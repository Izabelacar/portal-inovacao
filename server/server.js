require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');

const parquesRoutes = require('./routes/parques');
const cadeiasRoutes = require('./routes/cadeias');
const ecossistemaRoutes = require('./routes/ecossistema');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/parques', parquesRoutes);
app.use('/api/cadeias', cadeiasRoutes);
app.use('/api/ecossistema', ecossistemaRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
