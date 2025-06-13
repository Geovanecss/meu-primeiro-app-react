import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);

  // Função para buscar posts da API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
      setPosts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar publicações');
      setLoading(false);
    }
  };

  // Função para carregar favoritos do AsyncStorage
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err);
    }
  };

  // Função para salvar favoritos no AsyncStorage
  const saveFavorites = async (newFavorites) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (err) {
      console.error('Erro ao salvar favoritos:', err);
    }
  };

  // Função para adicionar/remover favorito
  const toggleFavorite = (post) => {
    const isFavorite = favorites.some((fav) => fav.id === post.id);
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter((fav) => fav.id !== post.id);
    } else {
      newFavorites = [...favorites, post];
    }
    saveFavorites(newFavorites);
  };

  // Carregar posts e favoritos ao iniciar
  useEffect(() => {
    fetchPosts();
    loadFavorites();
  }, []);

  // Renderizar cada item da lista
  const renderItem = ({ item }) => {
    const isFavorite = favorites.some((fav) => fav.id === item.id);
    return (
      <View style={styles.postContainer}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postBody}>{item.body}</Text>
        <Button
          title={isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
          onPress={() => toggleFavorite(item)}
          color={isFavorite ? '#ff4444' : '#007bff'}
        />
      </View>
    );
  };

  // Alternar entre lista de posts e favoritos
  const toggleView = () => {
    setShowFavorites(!showFavorites);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Tentar Novamente" onPress={fetchPosts} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.toggleButton} onPress={toggleView}>
        <Text style={styles.toggleButtonText}>
          {showFavorites ? 'Ver Todas as Publicações' : 'Ver Favoritos'}
        </Text>
      </TouchableOpacity>
      <FlatList
        data={showFavorites ? favorites : posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          showFavorites && favorites.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma publicação favoritada.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postBody: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  toggleButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
});