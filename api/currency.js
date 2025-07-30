import axios from 'axios';

export default async function handler(req, res) {
  const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/GBP`);
  res.status(200).json(response.data);
}
