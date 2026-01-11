import { Injectable, signal } from '@angular/core';
import { User, UserRole, CheckIn, Alert, Resource, DiaryEntry } from './models';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private keyCheckIns = 'mind_checkins';
    private keyAlerts = 'mind_alerts';
    private keyUser = 'mind_user';
    private keyUsersList = 'mind_users_list';
    private keyDiary = 'mind_diary';

    currentUser = signal<User | null>(this.loadUser());
    lang = signal<'es' | 'eu'>('es');
    checkInsSignal = signal<CheckIn[]>([]);
    diarySignal = signal<DiaryEntry[]>([]);

    constructor() {
        this.initMockData();
        this.refreshCheckIns();
        this.refreshDiary();
    }

    private initMockData() {
        if (!localStorage.getItem(this.keyCheckIns)) {
            localStorage.setItem(this.keyCheckIns, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.keyAlerts)) {
            localStorage.setItem(this.keyAlerts, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.keyDiary)) {
            localStorage.setItem(this.keyDiary, JSON.stringify([]));
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
            points: 0
        };
        localStorage.setItem(this.keyUser, JSON.stringify(user));
        this.currentUser.set(user);
        this.refreshCheckIns();
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
            points: 0
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
            this.refreshCheckIns();

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
        this.refreshCheckIns();
        return { success: true, message: 'Sesión iniciada.' };
    }

    deleteCheckIn(id: string) {
        let allCheckIns = this.getAllCheckIns();
        allCheckIns = allCheckIns.filter(c => c.id !== id);
        localStorage.setItem(this.keyCheckIns, JSON.stringify(allCheckIns));
        this.refreshCheckIns();
    }

    private getUsersList(): User[] {
        const data = localStorage.getItem(this.keyUsersList);
        return data ? JSON.parse(data) : [];
    }

    logout() {
        localStorage.removeItem(this.keyUser);
        this.currentUser.set(null);
        this.refreshCheckIns();
    }

    saveCheckIn(data: Omit<CheckIn, 'id' | 'userId' | 'timestamp'>) {
        const user = this.currentUser();
        if (!user) return;

        const allCheckIns = this.getAllCheckIns();
        const newCheckIn: CheckIn = {
            ...data,
            id: 'ci_' + Date.now(),
            userId: user.id,
            timestamp: new Date()
        };

        allCheckIns.push(newCheckIn);
        localStorage.setItem(this.keyCheckIns, JSON.stringify(allCheckIns));

        // Evaluate alerts
        this.evaluateAlerts();
        this.refreshCheckIns();

        // Add 10 points
        if (user.points !== undefined) {
            user.points = (user.points || 0) + 10;
            localStorage.setItem(this.keyUser, JSON.stringify(user));
            this.currentUser.set(user);

            // También actualizamos la lista global de usuarios
            const users = this.getUsersList();
            const index = users.findIndex(u => u.email === user.email);
            if (index !== -1) {
                users[index].points = user.points;
                localStorage.setItem(this.keyUsersList, JSON.stringify(users));
            }
        }
    }

    refreshDiary() {
        const data = localStorage.getItem(this.keyDiary);
        const entries: DiaryEntry[] = data ? JSON.parse(data) : [];
        const user = this.currentUser();
        if (!user) {
            this.diarySignal.set([]);
            return;
        }

        const userEntries = entries
            .filter(e => e.userId === user.id)
            .map(e => ({ ...e, timestamp: new Date(e.timestamp) }))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        this.diarySignal.set(userEntries);
    }

    saveDiaryEntry(content: string) {
        const user = this.currentUser();
        if (!user) return;

        const data = localStorage.getItem(this.keyDiary);
        const entries: DiaryEntry[] = data ? JSON.parse(data) : [];

        const newEntry: DiaryEntry = {
            id: Math.random().toString(36).substr(2, 9),
            userId: user.id,
            content,
            timestamp: new Date()
        };

        entries.push(newEntry);
        localStorage.setItem(this.keyDiary, JSON.stringify(entries));
        this.refreshDiary();
    }

    deleteDiaryEntry(id: string) {
        let data = localStorage.getItem(this.keyDiary);
        if (!data) return;

        let entries: DiaryEntry[] = JSON.parse(data);
        entries = entries.filter(e => e.id !== id);

        localStorage.setItem(this.keyDiary, JSON.stringify(entries));
        this.refreshDiary();
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
        // Map timestamps back to Date objects
        return parsed.map((c: any) => ({
            ...c,
            timestamp: typeof c.timestamp === 'string' ? new Date(c.timestamp) : c.timestamp
        }));
    }

    refreshCheckIns() {
        const user = this.currentUser();
        if (!user) {
            this.checkInsSignal.set([]);
            return;
        }
        const filtered = this.getAllCheckIns().filter(c => c.userId === user.id);
        this.checkInsSignal.set(filtered);
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
                points: 0
            };
            users.push(user);
            localStorage.setItem(this.keyUsersList, JSON.stringify(users));
        }

        localStorage.setItem(this.keyUser, JSON.stringify(user));
        this.currentUser.set(user);
        this.refreshCheckIns();
    }

    private evaluateAlerts() {
        const user = this.currentUser();
        if (!user) return;

        const allCheckIns = this.getAllCheckIns();
        const userCheckIns = allCheckIns.filter(c => c.userId === user.id).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        if (userCheckIns.length === 0) return;

        const current = userCheckIns[0];
        const alerts = this.getAllAlerts();
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
            // Check if trend is worsening: current (0) < prev (1) < prevprev (2)
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
                name: 'Red de Salud Mental de Araba (Osakidetza)',
                nameEu: 'Arabako Osasun Mentaleko Sarea (Osakidetza)',
                description: 'Atención especializada en salud mental en el CSM de Vitoria-Gasteiz.',
                descriptionEu: 'Osasun mentaleko arreta espezializatua Gasteizko OMEan.',
                category: 'health',
                phone: '945 006 000',
                address: 'Calle Olaguíbel, 29, 01004 Vitoria-Gasteiz',
                location: { lat: 42.8467, lng: -2.6685 }
            },
            {
                id: '2',
                name: 'OMIJ - Oficina Municipal de Información Joven',
                nameEu: 'OMIJ - Gazteentzako Informazio Bulegoa',
                description: 'Asesoría psicológica gratuita para jóvenes en Gasteiz.',
                descriptionEu: 'Gazteentzako doako aholku psikologikoa Gasteizen.',
                category: 'health',
                phone: '945 161 330',
                address: 'Plaza de España, 1, 01001 Vitoria-Gasteiz',
                location: { lat: 42.8463, lng: -2.6735 }
            },
            {
                id: '3',
                name: 'ASAFES - Asociación Alavesa de Salud Mental',
                nameEu: 'ASAFES - Arabako Osasun Mentaleko Elkartea',
                description: 'Apoyo a familias y personas con enfermedad mental en Álava.',
                descriptionEu: 'Arabako buru gaixotasuna duten pertsonei eta senideei laguntza.',
                category: 'association',
                phone: '945 288 648',
                address: 'Calle Amapola, 11, 01003 Vitoria-Gasteiz',
                location: { lat: 42.8530, lng: -2.6660 }
            },
            {
                id: '4',
                name: 'Urgencias Osakidetza - Hospital Santiago',
                nameEu: 'Osakidetzako Larrialdiak - Santiago Ospitalea',
                description: 'Atención de emergencias 24h en el centro de Vitoria.',
                descriptionEu: '24 orduko larrialdi-arreta Gasteizko erdialdean.',
                category: 'emergency',
                phone: '945 007 000',
                address: 'Calle Olaguíbel, 29, 01004 Vitoria-Gasteiz',
                location: { lat: 42.8468, lng: -2.6680 }
            }
        ];
    }
}
