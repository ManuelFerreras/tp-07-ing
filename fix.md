- aplicacion muy trivial, agregar mas funcionalidades. DONE
- agregar pruebas de cypress mas complejas. DONE
- que los tests sean sobre los contenedores, no sobre el ambiente local. DONE

- que funcionen ambos entornos (qa y prod). DONE

- Modificar los test unitarios para hacerlos fallar en el codigo. Hacer commit de los test unitarios fallidos para hacer fallar el pipeline de GitHub Actions y verificar si se hace el deploy (no deberia debido al proceso de CI/CD, es decir, deben correr bien los tests unitarios para que recien se ejecute el pipeline del deploy - modificar el pipeline porque a mi me corrio igual por mas que fallara el pipeline del Unit Test).

Adicionales:

- Docker Compose. Entender toda la arquitectura de docker. DONE
- El zip de PROD debe ser el MISMO que QA. DONE
