export default (req, res) => res.status(200).json({ status: "nextauth test ok", url: req.url });
