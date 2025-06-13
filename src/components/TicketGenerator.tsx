import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

interface TicketPDFProps {
  name: string;
  email: string;
  movie: string;
  location: string;
  showtime: string;
  seats: string[];
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
    fontSize: 12,
    color: '#000',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1px solid #ccc',
  },
  section: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  text: {
    marginBottom: 8,
    fontSize: 12,
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
  },
  seats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  seat: {
    marginRight: 5,
    marginBottom: 5,
  }
});

// Componente per il rendering del PDF
const TicketPDF: React.FC<TicketPDFProps> = ({
  name,
  email,
  movie,
  location,
  showtime,
  seats,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Biglietto di Prenotazione</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.subtitle}>Dettagli Cliente</Text>
        <Text style={styles.text}>Nome: {name}</Text>
        <Text style={styles.text}>Email: {email}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.subtitle}>Dettagli Evento</Text>
        <Text style={styles.text}>Film: {movie}</Text>
        <Text style={styles.text}>Luogo: {location}</Text>
        <Text style={styles.text}>Orario: {showtime}</Text>
        <Text style={styles.subtitle}>Posti:</Text>
        <View style={styles.seats}>
          {seats.map((seat, index) => (
            <Text key={index} style={styles.seat}>{seat}{index < seats.length - 1 ? ', ' : ''}</Text>
          ))}
        </View>
      </View>
      <View style={styles.footer}>
        <Text>Baarìa Film Festival - {new Date().getFullYear()}</Text>
        <Text>Questo biglietto deve essere presentato all'ingresso</Text>
      </View>
    </Page>
  </Document>
);

// Funzione per generare il PDF come blob
export const generateTicketPDF = async (ticketData: TicketPDFProps): Promise<Blob> => {
  const blob = await pdf(
    <TicketPDF 
      name={ticketData.name} 
      email={ticketData.email} 
      movie={ticketData.movie} 
      location={ticketData.location} 
      showtime={ticketData.showtime} 
      seats={ticketData.seats} 
    />
  ).toBlob();
  
  return blob;
};

export default TicketPDF;