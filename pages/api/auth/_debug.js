export default (req, res) => res.status(200).json({ debug: true, url: req.url });
