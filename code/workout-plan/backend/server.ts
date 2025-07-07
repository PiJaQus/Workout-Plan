import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import { connectToDB } from './database';

interface Week {
  id: number;
  name: string;
  custom_name: string | null;
}
interface DBWorkout {
    id?: number;
    week_id: number;
    name: string;
    sets: number;
    reps: string;
    notes: string;
    muscle_groups?: string;
}
interface Workout {
    id?: number;
    week_id: number;
    name: string;
    sets: number;
    reps: string;
    notes: string;
    muscleGroups: string[];
}

const app: Express = express();

// Konfiguracja CORS
const allowedOrigins = ['http://localhost:5173', 'http://localhost'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}) as RequestHandler);

app.use(express.json() as RequestHandler);

let db: any; // Uproszczone typowanie dla bazy danych

// API: Get all weeks for a specific gender
const getWeeksHandler: RequestHandler = async (req, res, next) => {
    try {
        const gender = req.query.gender || 'man'; // Domyślnie 'man' dla zachowania wstecznej kompatybilności
        const weeks = await db.all('SELECT * FROM weeks WHERE gender = ? ORDER BY name', [gender]);
        res.json(weeks);
    } catch (err) {
        next(err);
    }
};
app.get('/api/weeks', getWeeksHandler);

// API: Get single week by ID
const getWeekByIdHandler: RequestHandler<{ id: string }> = async (req, res, next) => {
    try {
        const { id } = req.params;
        const week = await db.get('SELECT * FROM weeks WHERE id = ?', id);
        
        if (!week) {
            res.status(404).json({ error: 'Week not found' });
            return;
        }
        
        res.json(week);
    } catch (err) {
        next(err);
    }
};
app.get('/api/weeks/:id', getWeekByIdHandler);

// API: Add a new week
const addWeekHandler: RequestHandler = async (req, res, next) => {
    try {
        const { name, customName, gender = 'man' } = req.body;
        
        if (!name || typeof name !== 'string') {
            res.status(400).json({ error: 'Week name is required and must be a string' });
            return;
        }

        if (gender !== 'man' && gender !== 'woman') {
            res.status(400).json({ error: 'Gender must be either "man" or "woman"' });
            return;
        }

        try {
            const result = await db.run(
                'INSERT INTO weeks (name, custom_name, gender) VALUES (?, ?, ?)',
                [name, customName || null, gender]
            );
            
            const week = await db.get('SELECT * FROM weeks WHERE id = ?', result.lastID);
            res.status(201).json(week);
        } catch (err: any) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                res.status(409).json({ error: 'A week with this name already exists for the specified gender' });
            } else {
                throw err;
            }
        }
    } catch (err) {
        next(err);
    }
};
app.post('/api/weeks', addWeekHandler);

// API: Update week name
const updateWeekNameHandler: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { customName } = req.body;
        const weekId = parseInt(id, 10);
        
        if (isNaN(weekId)) {
            res.status(400).json({ error: 'Invalid week ID' });
            return;
        }
        
        const existingWeek = await db.get('SELECT * FROM weeks WHERE id = ?', weekId);
        if (!existingWeek) {
            res.status(404).json({ error: 'Week not found' });
            return;
        }
        
        await db.run(
            'UPDATE weeks SET custom_name = ? WHERE id = ?',
            [customName || null, weekId]
        );
        
        const week = await db.get('SELECT * FROM weeks WHERE id = ?', weekId);
        res.json(week);
    } catch (err) {
        next(err);
    }
};
app.put('/api/weeks/:id', updateWeekNameHandler);

// API: Delete a week
const deleteWeekHandler: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const weekId = parseInt(id, 10);
        
        if (isNaN(weekId)) {
            res.status(400).json({ error: 'Invalid week ID' });
            return;
        }
        
        const existingWeek = await db.get('SELECT * FROM weeks WHERE id = ?', weekId);
        if (!existingWeek) {
            res.status(404).json({ error: 'Week not found' });
            return;
        }
        
        await db.run('DELETE FROM workouts WHERE week_id = ?', weekId);
        await db.run('DELETE FROM weeks WHERE id = ?', weekId);
        
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};
app.delete('/api/weeks/:id', deleteWeekHandler);

// API: Get workouts for a week
const transformWorkout = (workout: DBWorkout): Workout => {
  const {
    muscle_groups,
    ...rest
  } = workout;
  return {
    ...rest,
    muscleGroups: muscle_groups ? JSON.parse(muscle_groups) : []
  };
};

const getWorkoutsForWeekHandler: RequestHandler = async (req, res, next) => {
    try {
        const { weekId } = req.params;
        const weekIdNum = parseInt(weekId, 10);
        
        if (isNaN(weekIdNum)) {
            res.status(400).json({ error: 'Invalid week ID' });
            return;
        }
        
        const week = await db.get('SELECT * FROM weeks WHERE id = ?', weekIdNum);
        if (!week) {
            res.status(404).json({ error: 'Week not found' });
            return;
        }

        const workouts: DBWorkout[] = await db.all(
            'SELECT * FROM workouts WHERE week_id = ? ORDER BY id',
            weekIdNum
        );

        const transformedWorkouts = workouts.map(transformWorkout);
        res.json(transformedWorkouts);
    } catch (err) {
        next(err);
    }
};
app.get('/api/weeks/:weekId/workouts', getWorkoutsForWeekHandler);

// API: Add a workout
const addWorkoutHandler: RequestHandler = async (req, res, next) => {
    try {
        const { weekId } = req.params;
        const weekIdNum = parseInt(weekId, 10);
        const { name, sets, reps, notes } = req.body;
        
        if (isNaN(weekIdNum)) {
            res.status(400).json({ error: 'Invalid week ID' });
            return;
        }
        
        if (!name || typeof name !== 'string') {
            res.status(400).json({ error: 'Workout name is required and must be a string' });
            return;
        }
        
        const week = await db.get('SELECT * FROM weeks WHERE id = ?', weekIdNum);
        if (!week) {
            res.status(404).json({ error: 'Week not found' });
            return;
        }

        const { muscleGroups } = req.body;
        const result = await db.run(
            'INSERT INTO workouts (week_id, name, sets, reps, notes, muscle_groups) VALUES (?, ?, ?, ?, ?, ?)',
            [weekIdNum, name, sets || 3, reps || '8-12', notes || '', JSON.stringify(muscleGroups || [])]
        );
        
        const workout = await db.get('SELECT * FROM workouts WHERE id = ?', result.lastID);
        if (workout) {
          res.status(201).json(transformWorkout(workout));
        } else {
          res.status(404).json({ error: 'Workout not found after creation' });
        }
    } catch (err) {
        next(err);
    }
};
app.post('/api/weeks/:weekId/workouts', addWorkoutHandler);

// API: Update a workout
const updateWorkoutHandler: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const workoutId = parseInt(id, 10);
        const { name, sets, reps, notes } = req.body;
        
        if (isNaN(workoutId)) {
            res.status(400).json({ error: 'Invalid workout ID' });
            return;
        }
        
        if (!name || typeof name !== 'string') {
            res.status(400).json({ error: 'Workout name is required and must be a string' });
            return;
        }
        
        const existingWorkout = await db.get('SELECT * FROM workouts WHERE id = ?', workoutId);
        if (!existingWorkout) {
            res.status(404).json({ error: 'Workout not found' });
            return;
        }
        const {muscleGroups} = req.body
        await db.run(
            'UPDATE workouts SET name = ?, sets = ?, reps = ?, notes = ?, muscle_groups = ? WHERE id = ?',
            [name, sets || 3, reps || '8-12', notes || '', JSON.stringify(muscleGroups || []), workoutId]
        );
        
        const workout = await db.get('SELECT * FROM workouts WHERE id = ?', workoutId);
        if (workout) {
          res.json(transformWorkout(workout));
        } else {
          res.status(404).json({ error: 'Workout not found after update' });
        }
    } catch (err) {
        next(err);
    }
};
app.put('/api/workouts/:id', updateWorkoutHandler);

// API: Delete a workout
const deleteWorkoutHandler: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const workoutId = parseInt(id, 10);
        
        if (isNaN(workoutId)) {
            res.status(400).json({ error: 'Invalid workout ID' });
            return;
        }
        
        const existingWorkout = await db.get('SELECT * FROM workouts WHERE id = ?', workoutId);
        if (!existingWorkout) {
            res.status(404).json({ error: 'Workout not found' });
            return;
        }
        
        await db.run('DELETE FROM workouts WHERE id = ?', workoutId);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};
app.delete('/api/workouts/:id', deleteWorkoutHandler);

// Error handling middleware
const errorHandler: express.ErrorRequestHandler = (err: Error, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }
    
    console.error('Error:', err);
    
    if (err instanceof Error) {
        res.status(500).json({ 
            error: 'Internal server error',
            message: err.message 
        });
    } else {
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'An unknown error occurred' 
        });
    }
};

app.use(errorHandler);

// 404 handler
const notFoundHandler: express.RequestHandler = (_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
};
app.use(notFoundHandler);

// Start serwera i połączenie z bazą
const PORT = 3001;
const startServer = async () => {
    try {
        db = await connectToDB();
        console.log('Connected to database');
        
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

// Obsługa nieobsłużonych wyjątków
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

startServer();
