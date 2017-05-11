/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
http://stackabuse.com/example-loading-a-java-class-at-runtime/
 */
package common;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ExtensionLoader<C> {

    private static ExtensionLoader INSTANCE = null;
    private URLClassLoader classLoader;

    // creador sincronizado para protegerse de posibles problemas  multi-hilo
    // otra prueba para evitar instanciación múltiple 
    private synchronized static void initializesExtensionLoader() {
        if (INSTANCE == null) {
            // Sólo se accede a la zona sincronizada
            // cuando la instancia no está creada
            synchronized (ExtensionLoader.class) {
                // En la zona sincronizada sería necesario volver
                // a comprobar que no se ha creado la instancia
                if (INSTANCE == null) {
                    INSTANCE = new ExtensionLoader();
                }
            }
        }
    }

    public static ExtensionLoader getExtensionLoader() {
        if (INSTANCE == null) {
            initializesExtensionLoader();
        }
        return INSTANCE;
    }

    public C loadClass(String directory, String classpath, Class<C> parentClass) throws ClassNotFoundException {
        File pluginsDir = new File(directory);
        for (File jar : pluginsDir.listFiles()) {
            try {
                Class<?> clazz = Class.forName("" + classpath, true, getExtensionLoader().getClassLoader(directory));
                Class<? extends C> newClass = clazz.asSubclass(parentClass);
                // Apparently its bad to use Class.newInstance, so we use 
                // newClass.getConstructor() instead
                Constructor<? extends C> constructor = newClass.getConstructor();
                return constructor.newInstance();

            } catch (ClassNotFoundException e) {
                // There might be multiple JARs in the directory,
                // so keep looking
                continue;
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InstantiationException e) {
                e.printStackTrace();
            }
        }
        throw new ClassNotFoundException("Class " + classpath + " wasn't found in directory " + directory);
    }

    public static boolean loadAllJar(String directory) {
        File pluginsDir = new File(directory);

        for (File jar : pluginsDir.listFiles()) {
            try {
                JarFile jarFile = new JarFile(jar.getAbsolutePath());
                Enumeration<JarEntry> e = jarFile.entries();

                while (e.hasMoreElements()) {
                    JarEntry je = e.nextElement();
                    if (je.isDirectory() || !je.getName().endsWith(".class")) {
                        continue;
                    }
                    // -6 because of .class
                    String className = je.getName().substring(0, je.getName().length() - 6);
                    className = className.replace('/', '.');
                    Class c = getExtensionLoader().getClassLoader(directory).loadClass(className);
                    try {
//                        if ("ftp_server".equals(className)) {
//                            Object ena = c.newInstance();
//                            Method method = ena.getClass().getDeclaredMethod("loadSettings", Map.class);
//                            method.invoke(ena, new HashMap<String, String>());
//                        } else {
                        c.newInstance();
//                        }
                    } catch (Exception ex) {
                        continue;
                    }
                }
            } catch (ClassNotFoundException e) {
                // There might be multiple JARs in the directory,
                // so keep looking
                continue;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return true;
    }

    private URLClassLoader getClassLoader(String directory) {
        if (getExtensionLoader().classLoader == null) {
            File pluginsDir = new File(directory);
            ArrayList<URL> urls = new ArrayList<URL>();
            for (File jar : pluginsDir.listFiles()) {
                try {
                    JarFile jarFile = new JarFile(jar.getAbsolutePath());
                    urls.add(new URL("jar:file:" + jar.getAbsolutePath() + "!/"));
                } catch (IOException ex) {
                    Logger.getLogger(ExtensionLoader.class.getName()).log(Level.SEVERE, null, ex);
                }
            }

            getExtensionLoader().classLoader = URLClassLoader.newInstance(urls.toArray(new URL[]{}));
        }
        return getExtensionLoader().classLoader;
    }
}
