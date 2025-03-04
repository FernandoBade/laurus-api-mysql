import express from 'express';
import usuarioRoutes from './rotas/usuarioRota';

const app = express();

app.use(express.json());
app.use('/usuarios', usuarioRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});