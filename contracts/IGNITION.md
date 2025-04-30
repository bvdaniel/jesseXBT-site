# Guía de Ignition para Despliegues de Smart Contracts

## ¿Qué es Ignition?

Ignition es un framework de despliegue desarrollado por el equipo de Hardhat (Nomic Foundation) que proporciona un enfoque más declarativo para desplegar smart contracts en comparación con los scripts tradicionales.

## Diferencias entre Scripts Tradicionales e Ignition

### Script Tradicional (deploy.ts)

En tu script tradicional (`scripts/deploy.ts`), el despliegue se maneja de forma imperativa:

```typescript
// Deploy with explicit gas settings
const lock = await Lock.deploy(unlockTime, {
  value: lockedAmount,
  gasLimit: 1_000_000,
  maxFeePerGas: parseEther("0.0000001"), // 100 gwei
  maxPriorityFeePerGas: parseEther("0.00000001"), // 10 gwei
});
```

Este enfoque:
- Define paso a paso cómo desplegar el contrato
- Requiere modificar el código para cambiar parámetros
- Es difícil de mantener para despliegues complejos con múltiples contratos
- No maneja bien las dependencias entre contratos

### Módulo de Ignition (Lock.ts)

Con Ignition (`ignition/modules/Lock.ts`), el despliegue es declarativo:

```typescript
// Configuración de gas dinámica
const gasSettings = {
  gasLimit: m.getParameter("gasLimit", 1_000_000),
  maxFeePerGas: m.getParameter("maxFeePerGas", parseGwei("1.5")),
  maxPriorityFeePerGas: m.getParameter("maxPriorityFeePerGas", parseGwei("0.1"))
};

// Deploy the Lock contract
const lock = m.contract("Lock", [unlockTime], {
  value: lockedAmount,
  ...gasSettings
});
```

Este enfoque:
- Define qué quieres desplegar, no cómo hacerlo
- Permite cambiar parámetros sin modificar el código
- Maneja automáticamente dependencias entre contratos
- Proporciona mejor gestión de estado y recuperación de errores

## Ventajas de Ignition

1. **Parametrización**: Puedes cambiar parámetros sin modificar el código
2. **Gestión de Dependencias**: Maneja automáticamente el orden de despliegue de contratos interdependientes
3. **Gestión de Estado**: Guarda el estado del despliegue, permitiendo reanudar despliegues fallidos
4. **Reproducibilidad**: Hace que los despliegues sean más reproducibles y mantenibles
5. **Verificación**: Facilita la verificación de contratos en exploradores de bloques

## Cómo Usar Ignition en Este Proyecto

### 1. Despliegue Básico

```bash
npx hardhat ignition deploy ignition/modules/Lock.ts --network base
```

Esto desplegará el contrato Lock con los valores por defecto definidos en el módulo.

### 2. Despliegue con Parámetros Personalizados

```bash
npx hardhat ignition deploy ignition/modules/Lock.ts --network base --parameters unlockTime=1735689600,maxFeePerGas=1500000000,maxPriorityFeePerGas=100000000
```

### 3. Usando los Scripts de Despliegue Proporcionados

Este proyecto incluye dos scripts para facilitar el despliegue:

#### a) Despliegue con Parámetros Hardcodeados

```bash
npx hardhat run scripts/deploy-with-ignition.ts --network base
```

#### b) Despliegue con Variables de Entorno

1. Copia `.env.example` a `.env` y configura tus variables
2. Ejecuta:

```bash
npx hardhat run scripts/deploy-with-env.ts --network base
```

## Configuración de Gas para Base

Base es una L2 de Ethereum que requiere configuraciones de gas específicas. Los valores recomendados son:

- **maxFeePerGas**: 1.5 gwei
- **maxPriorityFeePerGas**: 0.1 gwei

Estos valores están configurados por defecto en el módulo de Ignition, pero puedes sobrescribirlos al desplegar.

## Cómo Calcular el Gas

En tu proyecto anterior, usabas `viem` para calcular el gas:

```typescript
// En el script tradicional
maxFeePerGas: parseEther("0.0000001"), // 100 gwei
```

Con Ignition, puedes seguir usando `viem` pero de forma más clara:

```typescript
// En el módulo de Ignition
maxFeePerGas: m.getParameter("maxFeePerGas", parseGwei("1.5")), // 1.5 gwei
```

La función `parseGwei` es más clara que `parseEther` para valores de gas, ya que el gas normalmente se expresa en gwei.

## Conclusión

Ignition proporciona una forma más robusta y mantenible de desplegar contratos, especialmente para proyectos complejos. Te permite separar la configuración del código, facilitando el despliegue a diferentes redes con diferentes parámetros.