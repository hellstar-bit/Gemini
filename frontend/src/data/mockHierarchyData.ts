// frontend/src/data/mockHierarchyData.ts
// Datos mockeados para demostrar la funcionalidad de la vista jerárquica

export const mockCandidates = [
    {
        id: 1,
        name: "María Elena Rodríguez",
        email: "maria.rodriguez@campaign.com",
        phone: "3001234567",
        meta: 15000,
        description: "Candidata a Alcaldía de Barranquilla",
        position: "Alcaldesa",
        party: "Partido Liberal",
        isActive: true,
        groupsCount: 8,
        leadersCount: 45,
        votersCount: 12350
    },
    {
        id: 2,
        name: "Carlos Alberto Méndez",
        email: "carlos.mendez@campaign.com",
        phone: "3009876543",
        meta: 8000,
        description: "Candidato al Concejo de Barranquilla",
        position: "Concejal",
        party: "Cambio Radical",
        isActive: true,
        groupsCount: 5,
        leadersCount: 28,
        votersCount: 6890
    },
    {
        id: 3,
        name: "Ana Sofía Vargas",
        email: "ana.vargas@campaign.com",
        phone: "3005551234",
        meta: 12000,
        description: "Candidata a la Cámara de Representantes",
        position: "Representante",
        party: "Centro Democrático",
        isActive: true,
        groupsCount: 6,
        leadersCount: 32,
        votersCount: 8965
    }
];

export const mockGroups = {
    1: [ // Grupos para María Elena Rodríguez
        {
            id: 1,
            name: "Zona Norte - El Prado",
            description: "Cobertura de barrios del norte de Barranquilla",
            zone: "Norte",
            meta: 2500,
            isActive: true,
            candidateId: 1,
            candidate: { id: 1, name: "María Elena Rodríguez" },
            leadersCount: 8,
            planilladosCount: 1850
        },
        {
            id: 2,
            name: "Zona Centro - Boston",
            description: "Centro histórico y comercial",
            zone: "Centro",
            meta: 3000,
            isActive: true,
            candidateId: 1,
            candidate: { id: 1, name: "María Elena Rodríguez" },
            leadersCount: 12,
            planilladosCount: 2340
        },
        {
            id: 3,
            name: "Zona Sur - Villa Carolina",
            description: "Sectores residenciales del sur",
            zone: "Sur",
            meta: 2800,
            isActive: true,
            candidateId: 1,
            candidate: { id: 1, name: "María Elena Rodríguez" },
            leadersCount: 10,
            planilladosCount: 2100
        },
        {
            id: 4,
            name: "Zona Atlántico - Puerto",
            description: "Sector portuario y comercial",
            zone: "Atlántico",
            meta: 2200,
            isActive: true,
            candidateId: 1,
            candidate: { id: 1, name: "María Elena Rodríguez" },
            leadersCount: 7,
            planilladosCount: 1650
        }
    ],
    2: [ // Grupos para Carlos Alberto Méndez
        {
            id: 5,
            name: "Localidad Riomar",
            description: "Zona exclusiva y empresarial",
            zone: "Riomar",
            meta: 1800,
            isActive: true,
            candidateId: 2,
            candidate: { id: 2, name: "Carlos Alberto Méndez" },
            leadersCount: 6,
            planilladosCount: 1320
        },
        {
            id: 6,
            name: "Localidad Las Flores",
            description: "Sector residencial tradicional",
            zone: "Las Flores",
            meta: 2000,
            isActive: true,
            candidateId: 2,
            candidate: { id: 2, name: "Carlos Alberto Méndez" },
            leadersCount: 8,
            planilladosCount: 1580
        }
    ],
    3: [ // Grupos para Ana Sofía Vargas
        {
            id: 7,
            name: "Distrito La Concepción",
            description: "Zona universitaria y cultural",
            zone: "La Concepción",
            meta: 2500,
            isActive: true,
            candidateId: 3,
            candidate: { id: 3, name: "Ana Sofía Vargas" },
            leadersCount: 9,
            planilladosCount: 1950
        }
    ]
};

export const mockLeaders = {
    1: [ // Líderes para Zona Norte - El Prado
        {
            id: 1,
            cedula: "72123456",
            firstName: "Roberto",
            lastName: "Castillo Mejía",
            phone: "3101234567",
            email: "roberto.castillo@email.com",
            address: "Calle 76 #52-45",
            neighborhood: "El Prado",
            municipality: "Barranquilla",
            meta: 250,
            isActive: true,
            isVerified: true,
            groupId: 1,
            group: {
                id: 1,
                name: "Zona Norte - El Prado",
                meta: 2500,
                isActive: true,
                candidateId: 1,
                candidate: { id: 1, name: "María Elena Rodríguez" }
            },
            votersCount: 234,
            planilladosCount: 234
        },
        {
            id: 2,
            cedula: "72234567",
            firstName: "Carmen",
            lastName: "Díaz Torres",
            phone: "3109876543",
            email: "carmen.diaz@email.com",
            address: "Carrera 54 #78-12",
            neighborhood: "Alto Prado",
            municipality: "Barranquilla",
            meta: 300,
            isActive: true,
            isVerified: true,
            groupId: 1,
            group: {
                id: 1,
                name: "Zona Norte - El Prado",
                meta: 2500,
                isActive: true,
                candidateId: 1,
                candidate: { id: 1, name: "María Elena Rodríguez" }
            },
            votersCount: 287,
            planilladosCount: 287
        },
        {
            id: 3,
            cedula: "72345678",
            firstName: "Luis",
            lastName: "Herrera González",
            phone: "3105551234",
            email: "luis.herrera@email.com",
            address: "Calle 72 #48-23",
            neighborhood: "Granadillo",
            municipality: "Barranquilla",
            meta: 200,
            isActive: true,
            isVerified: false,
            groupId: 1,
            group: {
                id: 1,
                name: "Zona Norte - El Prado",
                meta: 2500,
                isActive: true,
                candidateId: 1,
                candidate: { id: 1, name: "María Elena Rodríguez" }
            },
            votersCount: 156,
            planilladosCount: 156
        }
    ],
    2: [ // Líderes para Zona Centro - Boston
        {
            id: 4,
            cedula: "72456789",
            firstName: "Patricia",
            lastName: "Morales Ruiz",
            phone: "3102223333",
            email: "patricia.morales@email.com",
            address: "Carrera 44 #34-67",
            neighborhood: "Centro",
            municipality: "Barranquilla",
            meta: 280,
            isActive: true,
            isVerified: true,
            groupId: 2,
            group: {
                id: 2,
                name: "Zona Centro - Boston",
                meta: 3000,
                isActive: true,
                candidateId: 1,
                candidate: { id: 1, name: "María Elena Rodríguez" }
            },
            votersCount: 298,
            planilladosCount: 298
        },
        {
            id: 5,
            cedula: "72567890",
            firstName: "Miguel",
            lastName: "Sánchez Jiménez",
            phone: "3103334444",
            email: "miguel.sanchez@email.com",
            address: "Calle 45 #41-89",
            neighborhood: "Boston",
            municipality: "Barranquilla",
            meta: 220,
            isActive: true,
            isVerified: true,
            groupId: 2,
            group: {
                id: 2,
                name: "Zona Centro - Boston",
                meta: 3000,
                isActive: true,
                candidateId: 1,
                candidate: { id: 1, name: "María Elena Rodríguez" }
            },
            votersCount: 203,
            planilladosCount: 203
        }
    ]
};

export const mockPlanillados = {
    1: [ // Planillados para Roberto Castillo
        {
            id: 1,
            cedula: "72111111",
            nombres: "José Antonio",
            apellidos: "García López",
            celular: "3201111111",
            direccion: "Calle 78 #53-21",
            barrioVive: "El Prado",
            municipioVotacion: "Barranquilla",
            zonaPuesto: "Zona 1 - Puesto 15",
            mesa: "001",
            estado: "verificado" as const,
            esEdil: false,
            actualizado: true,
            liderId: 1,
            lider: {
                id: 1,
                cedula: "72123456",
                firstName: "Roberto",
                lastName: "Castillo Mejía",
                phone: "3101234567",
                email: "roberto.castillo@email.com",
                address: "Calle 76 #52-45",
                neighborhood: "El Prado",
                municipality: "Barranquilla",
                meta: 250,
                isActive: true,
                isVerified: true,
                groupId: 1,
                votersCount: 234,
                planilladosCount: 234
            },
            grupoId: 1,
            grupo: {
                id: 1,
                name: "Zona Norte - El Prado",
                description: "Cobertura de barrios del norte de Barranquilla",
                zone: "Norte",
                meta: 2500,
                isActive: true,
                candidateId: 1,
                leadersCount: 8,
                planilladosCount: 1850
            }
        },
        {
            id: 2,
            cedula: "72222222",
            nombres: "María Alejandra",
            apellidos: "Pérez Martínez",
            celular: "3202222222",
            direccion: "Carrera 55 #79-34",
            barrioVive: "El Prado",
            municipioVotacion: "Barranquilla",
            zonaPuesto: "Zona 1 - Puesto 15",
            mesa: "002",
            estado: "verificado" as const,
            esEdil: true,
            actualizado: true,
            liderId: 1,
            lider: {
                id: 1,
                cedula: "72123456",
                firstName: "Roberto",
                lastName: "Castillo Mejía",
                phone: "3101234567",
                email: "roberto.castillo@email.com",
                address: "Calle 76 #52-45",
                neighborhood: "El Prado",
                municipality: "Barranquilla",
                meta: 250,
                isActive: true,
                isVerified: true,
                groupId: 1,
                votersCount: 234,
                planilladosCount: 234
            },
            grupoId: 1,
            grupo: {
                id: 1,
                name: "Zona Norte - El Prado",
                description: "Cobertura de barrios del norte de Barranquilla",
                zone: "Norte",
                meta: 2500,
                isActive: true,
                candidateId: 1,
                leadersCount: 8,
                planilladosCount: 1850
            }
        },
        {
            id: 3,
            cedula: "72333333",
            nombres: "Carlos Eduardo",
            apellidos: "Rodríguez Silva",
            celular: "3203333333",
            direccion: "Calle 74 #50-67",
            barrioVive: "Alto Prado",
            municipioVotacion: "Barranquilla",
            zonaPuesto: "Zona 1 - Puesto 16",
            mesa: "025",
            estado: "pendiente" as const,
            esEdil: false,
            actualizado: false,
            liderId: 1,
            lider: {
                id: 1,
                cedula: "72123456",
                firstName: "Roberto",
                lastName: "Castillo Mejía",
                phone: "3101234567",
                email: "roberto.castillo@email.com",
                address: "Calle 76 #52-45",
                neighborhood: "El Prado",
                municipality: "Barranquilla",
                meta: 250,
                isActive: true,
                isVerified: true,
                groupId: 1,
                votersCount: 234,
                planilladosCount: 234
            },
            grupoId: 1,
            grupo: {
                id: 1,
                name: "Zona Norte - El Prado",
                description: "Cobertura de barrios del norte de Barranquilla",
                zone: "Norte",
                meta: 2500,
                isActive: true,
                candidateId: 1,
                leadersCount: 8,
                planilladosCount: 1850
            }
        }
    ],
    2: [ // Planillados para Carmen Díaz
        {
            id: 4,
            cedula: "72444444",
            nombres: "Ana Isabel",
            apellidos: "Vásquez Moreno",
            celular: "3204444444",
            direccion: "Carrera 58 #81-12",
            barrioVive: "Alto Prado",
            municipioVotacion: "Barranquilla",
            zonaPuesto: "Zona 2 - Puesto 8",
            mesa: "043",
            estado: "verificado" as const,
            esEdil: false,
            actualizado: true,
            liderId: 2,
            lider: {
                id: 2,
                cedula: "72234567",
                firstName: "Carmen",
                lastName: "Díaz Torres",
                phone: "3109876543",
                email: "carmen.diaz@email.com",
                address: "Carrera 54 #78-12",
                neighborhood: "Alto Prado",
                municipality: "Barranquilla",
                meta: 300,
                isActive: true,
                isVerified: true,
                groupId: 1,
                votersCount: 287,
                planilladosCount: 287
            },
            grupoId: 1,
            grupo: {
                id: 1,
                name: "Zona Norte - El Prado",
                description: "Cobertura de barrios del norte de Barranquilla",
                zone: "Norte",
                meta: 2500,
                isActive: true,
                candidateId: 1,
                leadersCount: 8,
                planilladosCount: 1850
            }
        }
    ]
};

// Función helper para simular respuestas paginadas
export const createMockPaginatedResponse = <T>(data: T[], page: number = 1, limit: number = 20) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);
    
    return {
        data: paginatedData,
        meta: {
            total: data.length,
            page,
            limit,
            totalPages: Math.ceil(data.length / limit),
            hasNextPage: endIndex < data.length,
            hasPrevPage: page > 1
        }
    };
};