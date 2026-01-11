import { Injectable, signal } from '@angular/core';
import { User, UserRole, CheckIn, Alert, Resource } from './models';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private keyCheckIns = 'mind_checkins';
    private keyAlerts = 'mind_alerts';
    private keyUser = 'mind_user';
    private keyUsersList = 'mind_users_list';

    currentUser = signal<User | null>(this.loadUser());
    lang = signal<'es' | 'eu'>('es');

    constructor() {
        this.initMockData();
    }

    private initMockData() {
        if (!localStorage.getItem(this.keyCheckIns)) {
            const mockCheckIns: CheckIn[] = [
                { id: '1', userId: 'u1', timestamp: new Date(Date.now() - 86400000 * 2), mood: 'happy', anxiety: 3, energy: 7, sleptWell: true, notes: 'Buen día' },
                { id: '2', userId: 'u1', timestamp: new Date(Date.now() - 86400000), mood: 'neutral', anxiety: 5, energy: 5, sleptWell: false, notes: 'Un poco cansada' },
                { id: '3', userId: 'u2', timestamp: new Date(Date.now() - 86400000), mood: 'sad', anxiety: 9, energy: 2, sleptWell: false, notes: 'Mucha presión en el instituto' }
            ];
            localStorage.setItem(this.keyCheckIns, JSON.stringify(mockCheckIns));
        }

        if (!localStorage.getItem(this.keyAlerts)) {
            const mockAlerts: Alert[] = [
                { id: 'a1', userId: 'u2', timestamp: new Date(), type: 'anxiety', severity: 'red', resolved: false }
            ];
            localStorage.setItem(this.keyAlerts, JSON.stringify(mockAlerts));
        }
    }

    private loadUser(): User | null {
        const data = localStorage.getItem(this.keyUser);
        return data ? JSON.parse(data) : null;
    }

    login(email: string, role: UserRole) {
        const user: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: email.split('@')[0],
            email,
            role,
            isVerified: true,
            points: 100
        };
        localStorage.setItem(this.keyUser, JSON.stringify(user));
        this.currentUser.set(user);
    }

    loginWithName(name: string, email: string, role: UserRole) {
        // Redundant with the new register/login flow, but keeping for compatibility if needed.
        this.register(name, email, '', role);
    }

    register(name: string, email: string, password: string, role: UserRole): { success: boolean, message: string } {
        const users = this.getUsersList();
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'El email ya está registrado.' };
        }

        const newUser: User = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name,
            email,
            password,
            role,
            isVerified: false, // User must verify email
            points: 100
        };

        users.push(newUser);
        localStorage.setItem(this.keyUsersList, JSON.stringify(users));

        // Simulating sending an email
        console.log(`[SIMULACIÓN] Email enviado a ${email}. Código de verificación: 123456`);

        return { success: true, message: 'Registro exitoso. Por favor, verifica tu email.' };
    }

    verifyEmail(email: string, code: string): { success: boolean, message: string } {
        if (code !== '123456') {
            return { success: false, message: 'Código de verificación incorrecto.' };
        }

        const users = this.getUsersList();
        const user = users.find(u => u.email === email);

        if (user) {
            user.isVerified = true;
            localStorage.setItem(this.keyUsersList, JSON.stringify(users));

            // Auto login after verification
            localStorage.setItem(this.keyUser, JSON.stringify(user));
            this.currentUser.set(user);

            return { success: true, message: 'Email verificado correctamente.' };
        }

        return { success: false, message: 'Usuario no encontrado.' };
    }

    loginWithPassword(email: string, password: string): { success: boolean, message: string } {
        const users = this.getUsersList();
        const user = users.find(u => u.email === email);

        if (!user) {
            return { success: false, message: 'Usuario no encontrado.' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Contraseña incorrecta.' };
        }

        if (!user.isVerified) {
            return { success: false, message: 'PENDING_VERIFICATION' };
        }

        localStorage.setItem(this.keyUser, JSON.stringify(user));
        this.currentUser.set(user);
        return { success: true, message: 'Sesión iniciada.' };
    }

    private getUsersList(): User[] {
        const data = localStorage.getItem(this.keyUsersList);
        return data ? JSON.parse(data) : [];
    }

    logout() {
        localStorage.removeItem(this.keyUser);
        this.currentUser.set(null);
    }

    saveCheckIn(data: Omit<CheckIn, 'id' | 'userId' | 'timestamp'>) {
        const user = this.currentUser();
        if (!user) return;

        const allCheckIns = this.getAllCheckIns();
        const newCheckIn: CheckIn = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            userId: user.id,
            timestamp: new Date()
        };

        allCheckIns.push(newCheckIn);
        localStorage.setItem(this.keyCheckIns, JSON.stringify(allCheckIns));

        // Check for alerts
        this.evaluateAlerts(newCheckIn, allCheckIns);

        // Gamification
        if (user.points !== undefined) {
            user.points += 10;
            this.currentUser.set({ ...user });
            localStorage.setItem(this.keyUser, JSON.stringify(user));
        }
    }

    getCheckIns(): CheckIn[] {
        const all = this.getAllCheckIns();
        const user = this.currentUser();
        if (!user) return [];
        return all.filter((c: CheckIn) => c.userId === user.id);
    }

    private getAllCheckIns(): CheckIn[] {
        const data = localStorage.getItem(this.keyCheckIns);
        const parsed = data ? JSON.parse(data) : [];
        return parsed.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) }));
    }

    loginWithGoogle(role: UserRole, customEmail?: string, customName?: string) {
        const email = customEmail || 'google_user@gmail.com';
        const name = customName || 'Usuario Google';

        const users = this.getUsersList();
        let user = users.find(u => u.email === email);

        if (!user) {
            user = {
                id: 'google_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name,
                email,
                role,
                isVerified: true, // Google users are pre-verified
                points: 150
            };
            users.push(user);
            localStorage.setItem(this.keyUsersList, JSON.stringify(users));
        }

        localStorage.setItem(this.keyUser, JSON.stringify(user));
        this.currentUser.set(user);
    }

    private evaluateAlerts(current: CheckIn, all: CheckIn[]) {
        const alerts = this.getAllAlerts();
        const userCheckIns = all.filter(c => c.userId === current.userId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        let newAlertAdded = false;

        // Rule: Anxiety > 8
        if (current.anxiety >= 8) {
            alerts.push(this.createAlert(current.userId, 'anxiety', 'red'));
            newAlertAdded = true;
        }

        // Rule: Energy < 3
        if (current.energy <= 3) {
            alerts.push(this.createAlert(current.userId, 'energy', 'yellow'));
            newAlertAdded = true;
        }

        // Rule: 3 days worsening
        if (userCheckIns.length >= 3) {
            const moodValues = { 'very-happy': 4, 'happy': 3, 'neutral': 2, 'sad': 1 };
            const statuses = userCheckIns.slice(0, 3).map(c => moodValues[c.mood]);
            if (statuses[0] < statuses[1] && statuses[1] < statuses[2]) {
                alerts.push(this.createAlert(current.userId, 'trend', 'yellow'));
                newAlertAdded = true;
            }
        }

        if (newAlertAdded) {
            localStorage.setItem(this.keyAlerts, JSON.stringify(alerts));
        }
    }

    private createAlert(userId: string, type: Alert['type'], severity: Alert['severity']): Alert {
        return {
            id: Math.random().toString(36).substr(2, 9),
            userId,
            type,
            severity,
            timestamp: new Date(),
            resolved: false
        };
    }

    getAlerts(): Alert[] {
        const data = localStorage.getItem(this.keyAlerts);
        const parsed: Alert[] = data ? JSON.parse(data) : [];
        const user = this.currentUser();
        if (!user) return [];
        // Map dates
        return parsed
            .map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) }))
            .filter(a => a.userId === user.id);
    }

    private getAllAlerts(): Alert[] {
        const data = localStorage.getItem(this.keyAlerts);
        return data ? JSON.parse(data) : [];
    }

    setLanguage(l: 'es' | 'eu') {
        this.lang.set(l);
    }

    t() {
        const translations = {
            es: {
                home: 'Inicio',
                checkIn: 'Check-in',
                resources: 'Recursos',
                logout: 'Cerrar Sesión',
                login: 'Entrar'
            },
            eu: {
                home: 'Hasiera',
                checkIn: 'Check-in',
                resources: 'Baliabideak',
                logout: 'Saioa Itxi',
                login: 'Sartu'
            }
        };
        return translations[this.lang()];
    }

    getResources(): Resource[] {
        return [
            {
                id: '1',
                name: 'Centro de Salud Mental Joven',
                nameEu: 'Gazteentzako Osasun Mentaleko Zentroa',
                description: 'Apoyo psicológico especializado para jóvenes.',
                descriptionEu: 'Gazteentzako laguntza psikologiko espezializatua.',
                category: 'health',
                phone: '944 000 000',
                address: 'Gran Vía 45, Bilbao',
                location: { lat: 43.263, lng: -2.935 }
            },
            {
                id: '2',
                name: 'Teléfono Contra el Suicidio',
                nameEu: 'Suizidioaren aurkako telefonoa',
                description: 'Atención inmediata y anónima 24/7.',
                descriptionEu: 'Berehalako arreta anonimoa, eguneko 24 orduetan.',
                category: 'emergency',
                phone: '024',
                address: 'Nacional',
            }
        ];
    }
}
